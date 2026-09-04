#!/usr/bin/env python3
"""
สร้างไฟล์สนามความเร็วกระแสน้ำให้ลูกโลก 3 มิติในหน้า stats/explore.html

ทำไมต้องมีสคริปต์นี้
  ไฟล์ที่เว็บใช้อยู่ตอนนี้เป็นกริด 1° ซึ่ง "หยาบเกินกว่าจะมีวงน้ำวนอยู่ในข้อมูล"
  วงน้ำวนในมหาสมุทรมีขนาดราว Rossby radius (~30 กม. ที่ละติจูดกลาง) แต่ 1 องศา
  กว้าง ~111 กม. ที่เส้นศูนย์สูตร กริดจึงใหญ่กว่าวงน้ำวนทั้งวง — เพิ่มจำนวนเส้น
  เท่าไรก็ไม่ทำให้วงน้ำวนโผล่ ต้องเพิ่มความละเอียดของ "ข้อมูล" เท่านั้น
  สคริปต์นี้ดึงข้อมูลที่ความละเอียดเต็มของแหล่ง (ปกติ 0.25°) มาทำเป็นไฟล์ใหม่

ใช้ยังไง
  # ดึงสดจาก NOAA ERDDAP (ต้องต่อเน็ตได้)
  python3 build-ocean-uv.py

  # ถ้าโหลด CSV มาไว้แล้ว หรืออยากตรวจสคริปต์โดยไม่ยิงเน็ต
  python3 build-ocean-uv.py --from-csv ocean.csv

  # ดูว่าจะยิง URL อะไรโดยไม่ดึงจริง
  python3 build-ocean-uv.py --print-url

ผลลัพธ์ (เขียนทับของเดิม — สำรองไว้ก่อนถ้าไม่อยากเสีย)
  ocean-uv.bin        u,v สลับกันช่องละคู่ เรียงตามละติจูดแล้วลองจิจูด
  ocean-uv-meta.json  มี dtype/scale/noData ให้หน้าเว็บอ่านเอง
                      → หน้าเว็บรองรับทั้ง int8 และ int16 อยู่แล้ว ไม่ต้องแก้โค้ด

ใช้แต่ไลบรารีมาตรฐานของ Python ไม่ต้องติดตั้งอะไรเพิ่ม
"""
import argparse, csv, io, json, math, os, struct, sys, urllib.request

BASE    = "https://coastwatch.pfeg.noaa.gov/erddap"
DATASET = "nesdisSSH1day"          # SSH + geostrophic currents จาก altimetry (RADS)
UVARS   = ("ugos", "vgos")         # ความเร็วตะวันออก / เหนือ (m/s)
HERE    = os.path.dirname(os.path.abspath(__file__))

# int16 เก็บได้ ±32767 · สเกล 0.0005 m/s ต่อหน่วย → รองรับถึง ±16.3 m/s
# กระแสน้ำแรงสุดในโลกราว 3 m/s จึงไม่มีการตัดยอดเหมือนไฟล์ int8 เดิม (เพดาน 2.54 m/s)
SCALE   = 0.0005
NODATA  = -32768


def get(url, timeout=300):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


# ค่าที่ใช้ถ้าถาม ERDDAP ไม่สำเร็จ — อิงจากไฟล์ 1° เดิมที่มาจากชุดข้อมูลเดียวกัน
FALLBACK = {"lat": "latitude", "lon": "longitude", "time": "time",
            "range": {"latitude": [-89.875, 89.875], "longitude": [-179.875, 179.875]}}


def discover():
    """ถามชื่อ/ช่วงของมิติจากตัว ERDDAP เอง แทนการเดา — กันพังเวลาแหล่งเปลี่ยนรูปแบบ"""
    info = json.loads(get(BASE + "/info/" + DATASET + "/index.json"))
    rows = info["table"]["rows"]
    cols = info["table"]["columnNames"]
    iRow, iVar, iAttr, iVal = (cols.index(c) for c in
                               ("Row Type", "Variable Name", "Attribute Name", "Value"))
    dims, actual = [], {}
    for r in rows:
        if r[iRow] == "dimension":
            dims.append(r[iVar])
        if r[iAttr] == "actual_range":
            actual[r[iVar]] = [float(x) for x in str(r[iVal]).split(",")]
    latn = next((d for d in dims if d.lower().startswith("lat")), None)
    lonn = next((d for d in dims if d.lower().startswith("lon")), None)
    timn = next((d for d in dims if d.lower().startswith("time")), None)
    if not (latn and lonn):
        sys.exit("หามิติ lat/lon ในชุดข้อมูลไม่เจอ — โครงสร้างแหล่งข้อมูลอาจเปลี่ยนไป")
    return {"lat": latn, "lon": lonn, "time": timn, "range": actual}


def build_url(d, lat_from=None, lat_to=None, stride=1):
    """สร้าง URL — ระบุช่วงละติจูดได้ เพื่อแบ่งโหลดเป็นแถบเวลาไฟล์ใหญ่เกิน"""
    t = "[(last)]" if d["time"] else ""
    la = d["range"].get(d["lat"], [-89.875, 89.875])
    lo = d["range"].get(d["lon"], [-179.875, 179.875])
    a = la[0] if lat_from is None else lat_from
    b = la[1] if lat_to   is None else lat_to
    span = "[(%s):%d:(%s)][(%s):%d:(%s)]" % (a, stride, b, lo[0], stride, lo[1])
    q = ",".join(v + t + span for v in UVARS)
    return BASE + "/griddap/" + DATASET + ".csv?" + q


def parse_csv(text):
    """คืน (จุดข้อมูล, เวลา) — จุดข้อมูลเป็น dict[(lat,lon)] = (u,v)"""
    rd = csv.reader(io.StringIO(text))
    header = next(rd)
    next(rd)                                    # บรรทัดหน่วย
    idx = {name: i for i, name in enumerate(header)}
    la = next(i for n, i in idx.items() if n.lower().startswith("lat"))
    lo = next(i for n, i in idx.items() if n.lower().startswith("lon"))
    iu, iv = idx[UVARS[0]], idx[UVARS[1]]
    it = next((i for n, i in idx.items() if n.lower().startswith("time")), None)
    pts, tstamp = {}, None
    for row in rd:
        if not row or len(row) <= max(la, lo, iu, iv):
            continue
        if tstamp is None and it is not None:
            tstamp = row[it]
        try:
            lat, lon = float(row[la]), float(row[lo])
        except ValueError:
            continue
        def num(s):
            s = s.strip()
            if s == "" or s.upper() == "NAN":
                return None
            try:    return float(s)
            except ValueError: return None
        u, v = num(row[iu]), num(row[iv])
        pts[(lat, lon)] = (u, v)
    return pts, tstamp


def to_grid(pts, tstamp):
    lats = sorted({k[0] for k in pts})
    lons = sorted({k[1] for k in pts})
    if len(lats) < 2 or len(lons) < 2:
        sys.exit("ข้อมูลที่ได้มีน้อยเกินไป (lat=%d lon=%d)" % (len(lats), len(lons)))
    dlat = round(lats[1] - lats[0], 6)
    dlon = round(lons[1] - lons[0], 6)
    nlat, nlon = len(lats), len(lons)
    # แหล่งบางที่ให้ลองจิจูด 0..360 — หน้าเว็บคาด -180..180
    shift = any(l > 180 for l in lons)
    out = [NODATA] * (nlat * nlon * 2)
    valid = 0
    maxspd = 0.0
    clipped = 0
    for j, la in enumerate(lats):
        for i, lo in enumerate(lons):
            uv = pts.get((la, lo))
            if not uv or uv[0] is None or uv[1] is None:
                continue
            u, v = uv
            spd = math.hypot(u, v)
            maxspd = max(maxspd, spd)
            qu, qv = round(u / SCALE), round(v / SCALE)
            if abs(qu) > 32767 or abs(qv) > 32767:
                clipped += 1
                qu = max(-32767, min(32767, qu))
                qv = max(-32767, min(32767, qv))
            tgt = i
            if shift:                                   # 0..360 → -180..180
                tgt = (i + nlon // 2) % nlon
            k = (j * nlon + tgt) * 2
            out[k], out[k + 1] = qu, qv
            valid += 1
    lon0 = lons[0] - 180 if shift else lons[0]
    meta = {
        "source": "NOAA CoastWatch / NESDIS — Sea Surface Height Anomalies and Geostrophic "
                  "Currents from Altimetry (%s, RADS)" % DATASET,
        "sourceUrl": "%s/griddap/%s.html" % (BASE, DATASET),
        "variables": list(UVARS), "unit": "m/s",
        "time": tstamp or "unknown",
        "dtype": "int16", "endian": "little",
        "scale": SCALE, "noData": NODATA,
        "nlat": nlat, "nlon": nlon,
        "lat0": lats[0], "lon0": lon0, "dlat": dlat, "dlon": dlon,
        "layout": "interleaved u,v per cell; row-major lat then lon; Int16 little-endian * scale = m/s",
        "validCells": valid, "totalCells": nlat * nlon,
        "maxSpeed": round(maxspd, 4),
        "builtBy": "build-ocean-uv.py",
    }
    if clipped:
        meta["clippedCells"] = clipped
    return out, meta


def sanity(vals, meta):
    """เช็กว่าข้อมูลที่ได้สมเหตุสมผล — ทิศกระแสน้ำต้องตรงกับที่โลกรู้จัก"""
    nlat, nlon, sc, nd = meta["nlat"], meta["nlon"], meta["scale"], meta["noData"]
    def at(lat, lon):
        j = round((lat - meta["lat0"]) / meta["dlat"])
        i = round((((lon - meta["lon0"]) % 360) / meta["dlon"]))
        if not (0 <= j < nlat): return None
        i %= nlon
        k = (j * nlon + i) * 2
        u, v = vals[k], vals[k + 1]
        return None if (u == nd or v == nd) else (u * sc, v * sc)

    checks = [
        ("กัลฟ์สตรีมนอกฝั่งฟลอริดา", 27, -79.5, lambda c: c and c[1] > 0.3,      "ต้องไหลขึ้นเหนือ"),
        ("คุโรชิโอะใต้ญี่ปุ่น",      34, 141.5, lambda c: c and c[0] > 0.1,      "ต้องไหลไปตะวันออก"),
        ("อะกุลลัสใต้แอฟริกา",       -36,  22.5, lambda c: c and c[0] < 0,        "ต้องไหลไปตะวันตก"),
        ("กลางทวีปเอเชีย",            45,  90.5, lambda c: c is None,             "ต้องไม่มีข้อมูล (บนบก)"),
        ("กลางทะเลทรายซาฮารา",        23,  10.5, lambda c: c is None,             "ต้องไม่มีข้อมูล (บนบก)"),
    ]
    print("\n=== ตรวจความสมเหตุสมผล ===")
    bad = 0
    for name, la, lo, ok, why in checks:
        c = at(la, lo)
        good = ok(c)
        bad += 0 if good else 1
        shown = "ไม่มีข้อมูล" if c is None else "u=%.2f v=%.2f" % c
        print("  %s %-28s %-22s (%s)" % ("✓" if good else "✗", name, shown, why))
    frac = meta["validCells"] / meta["totalCells"]
    okfrac = 0.3 < frac < 0.85
    bad += 0 if okfrac else 1
    print("  %s สัดส่วนช่องที่เป็นน้ำ %.1f%% (คาดราว 55%% ของผิวโลกที่เป็นทะเลเปิด)"
          % ("✓" if okfrac else "✗", frac * 100))
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from-csv", help="อ่าน CSV จากไฟล์แทนการดึงจากเน็ต")
    ap.add_argument("--url", help="ระบุ URL เองแทนให้สคริปต์ถาม ERDDAP (ใช้เมื่อขั้นถามโครงสร้างมีปัญหา)")
    ap.add_argument("--print-url", action="store_true", help="แสดง URL ที่จะยิงแล้วจบ")
    ap.add_argument("--save-csv", help="เก็บ CSV ที่ดึงมาไว้ด้วย จะได้ไม่ต้องโหลดใหม่ถ้าขั้นถัดไปมีปัญหา")
    ap.add_argument("--bands", type=int, default=1, metavar="N",
                    help="แบ่งโหลดเป็น N แถบตามละติจูด (ใช้เมื่อโหลดทีเดียวแล้ว timeout — ลอง 6)")
    ap.add_argument("--stride", type=int, default=1, metavar="K",
                    help="เอาทุก K ช่อง (K=2 ได้ 0.5 องศา ไฟล์เล็กลง 4 เท่า แต่ยังละเอียดกว่าเดิม 2 เท่า)")
    ap.add_argument("--out-dir", default=HERE, help="โฟลเดอร์ปลายทาง")
    a = ap.parse_args()

    if a.from_csv:
        print("อ่าน CSV จาก", a.from_csv)
        text = io.open(a.from_csv, encoding="utf-8").read()
    else:
        if a.url:
            url = a.url
        else:
            print("ถามโครงสร้างชุดข้อมูลจาก ERDDAP…")
            try:
                d = discover()
            except Exception as e:
                print("  ! ถามโครงสร้างไม่สำเร็จ (%s: %s)" % (type(e).__name__, e))
                print("  → ใช้ค่าปริยายของชุดข้อมูลนี้แทน ถ้าผลออกมาผิดให้ระบุ URL เองด้วย --url")
                d = FALLBACK
            url = build_url(d, stride=a.stride)
        if a.print_url:
            print(url); return 0
        try:
            if a.bands > 1 and not a.url:
                la = d["range"].get(d["lat"], [-89.875, 89.875])
                lo_, hi_ = la[0], la[1]
                step = (hi_ - lo_) / a.bands
                parts = []
                for k in range(a.bands):
                    f = lo_ + step * k
                    t2 = hi_ if k == a.bands - 1 else lo_ + step * (k + 1) - 1e-6
                    u = build_url(d, f, t2, a.stride)
                    print("  แถบ %d/%d  lat %.3f…%.3f" % (k + 1, a.bands, f, t2))
                    parts.append(get(u))
                # ตัดหัวตาราง 2 บรรทัดของแถบที่ 2 เป็นต้นไปออก แล้วต่อกัน
                text = parts[0]
                for q in parts[1:]:
                    text += "\n" + "\n".join(q.splitlines()[2:])
            else:
                print("ดึงข้อมูล (ไฟล์ใหญ่ อาจใช้เวลาหลายนาที)…\n ", url)
                text = get(url)
        except Exception as e:
            print("\n✗ ดึงข้อมูลไม่สำเร็จ: %s: %s" % (type(e).__name__, e))
            print("  ลองแบ่งโหลดเป็นแถบ:  python3 %s --bands 6" % os.path.basename(__file__))
            print("  หรือลดความละเอียดครึ่งหนึ่ง:  python3 %s --stride 2" % os.path.basename(__file__))
            print("  หรือเปิด URL ข้างบนในเบราว์เซอร์แล้วใช้:  python3 %s --from-csv <ไฟล์>"
                  % os.path.basename(__file__))
            return 2
        if a.save_csv:
            io.open(a.save_csv, "w", encoding="utf-8").write(text)
            print("  เก็บ CSV ไว้ที่", a.save_csv)
    if not text.strip():
        sys.exit("ได้ข้อมูลเปล่ากลับมา — ตรวจ URL หรือชื่อชุดข้อมูล")
    head = text.lstrip()[:400].lower()
    if head.startswith("<") or "<table" in head or "<!doctype" in head:
        sys.exit("ไฟล์นี้เป็น HTML ไม่ใช่ CSV\n"
                 "  ในฟอร์ม ERDDAP ช่อง File type ค่าเริ่มต้นคือ .htmlTable ต้องเปลี่ยนเป็น .csv ก่อนกด Submit\n"
                 "  (หรือแก้ .htmlTable ใน URL เป็น .csv แล้วโหลดใหม่)")
    if "error" in head and "," not in head.split("\n")[0]:
        sys.exit("แหล่งข้อมูลตอบกลับมาเป็นข้อความแจ้งข้อผิดพลาด ไม่ใช่ตาราง:\n  " + text.strip()[:300])

    pts, tstamp = parse_csv(text)
    print("อ่านได้ %s จุด" % format(len(pts), ","))
    vals, meta = to_grid(pts, tstamp)
    bad = sanity(vals, meta)

    binp  = os.path.join(a.out_dir, "ocean-uv.bin")
    metap = os.path.join(a.out_dir, "ocean-uv-meta.json")
    if bad:
        print("\n✗ ไม่ผ่านการตรวจ %d ข้อ — ไม่เขียนทับไฟล์เดิม" % bad)
        return 1
    with open(binp, "wb") as f:
        f.write(struct.pack("<%dh" % len(vals), *vals))
    with open(metap, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print("\n✓ เขียนแล้ว")
    print("  %s  (%s ไบต์)" % (binp, format(os.path.getsize(binp), ",")))
    print("  %s" % metap)
    print("  กริด %g° × %g° (%d × %d) · เร็วสุด %.2f m/s · ช่องที่เป็นน้ำ %s"
          % (meta["dlat"], meta["dlon"], meta["nlon"], meta["nlat"],
             meta["maxSpeed"], format(meta["validCells"], ",")))
    print("\nหน้าเว็บอ่าน dtype จาก meta เอง — เปิด stats/explore.html ได้เลยไม่ต้องแก้โค้ด")
    return 0


if __name__ == "__main__":
    sys.exit(main())
