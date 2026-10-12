// ตัวช่วยดึงข้อความไทยจากไฟล์ .html / .js (ใช้โดย extract.js และ merge.js)
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const WORK = path.join(ROOT, ".scratch", "i18n");      // ไฟล์งานระหว่างแปล (ไม่เข้า git)
const OUT_EN = path.join(ROOT, "i18n", "en");          // ชุดคำแปลที่เว็บโหลดจริง
const TH = /[\u0E01-\u0E3A\u0E40-\u0E5B]/; // ไม่นับ ฿
const ATTR_RE = /\s(title|placeholder|alt|aria-label|data-tip|data-tooltip|label)\s*=\s*("([^"]*)"|'([^']*)')/gi;

const norm = (s) => s.replace(/\s+/g, " ").trim();

function glob(pat) {
  const dir = path.posix.dirname(pat), base = path.posix.basename(pat);
  const re = new RegExp("^" + base.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$");
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter((n) => re.test(n) && fs.statSync(path.join(abs, n)).isFile())
    .map((n) => (dir === "." ? n : dir + "/" + n))
    .sort();
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–",
  middot: "·", bull: "•", laquo: "«", raquo: "»", ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", copy: "©", times: "×",
  rarr: "→", larr: "←", deg: "°", plusmn: "±", zwj: "‍", zwnj: "‌" };
function decodeEnt(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const cp = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1);
      try { return String.fromCodePoint(cp); } catch (_) { return m; }
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

function unescJs(s) {
  return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (m, e) => {
    if (e[0] === "u" && e.length > 1) return String.fromCodePoint(parseInt(e[1] === "{" ? e.slice(2, -1) : e.slice(1), 16));
    if (e[0] === "x" && e.length === 3) return String.fromCharCode(parseInt(e.slice(1), 16));
    const map = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", 0: "\0", "\n": "", "\r": "" };
    return e in map ? map[e] : e;
  });
}

// ข้ามสตริงที่เริ่มที่ตำแหน่ง k (ชี้ที่เครื่องหมายคำพูด) → คืนตำแหน่งหลังปิด
function skipString(src, k) {
  const q = src[k];
  let j = k + 1;
  while (j < src.length && src[j] !== q) {
    if (src[j] === "\\") { j += 2; continue; }
    if (q !== "`" && src[j] === "\n") break;
    j++;
  }
  return j + 1;
}

// ดึง string literal ทั้งหมดของโค้ด JS (ข้ามคอมเมนต์ และ regex literal)
function jsStrings(src, base = 0) {
  const out = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { const e = src.indexOf("\n", i); if (e < 0) break; i = e; continue; }
    if (c === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); if (e < 0) break; i = e + 2; continue; }
    if (c === '"' || c === "'") {
      const j = skipString(src, i);
      out.push({ s: unescJs(src.slice(i + 1, j - 1)), at: base + i });
      i = j;
      continue;
    }
    if (c === "`") {
      let j = i + 1, buf = "";
      while (j < n && src[j] !== "`") {
        if (src[j] === "\\") { buf += src.slice(j, j + 2); j += 2; continue; }
        if (src[j] === "$" && src[j + 1] === "{") {
          let depth = 1, k = j + 2;
          const st = k;
          while (k < n && depth) {
            const ch = src[k];
            if (ch === '"' || ch === "'" || ch === "`") { k = skipString(src, k); continue; }
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
            k++;
          }
          out.push(...jsStrings(src.slice(st, k - 1), base + st));
          buf += "\u0001";
          j = k;
          continue;
        }
        buf += src[j++];
      }
      out.push({ s: unescJs(buf), at: base + i, tpl: true });
      i = j + 1;
      continue;
    }
    if (c === "/") {
      // regex literal หรือหาร? ดูอักขระสำคัญตัวก่อนหน้า
      let p = i - 1;
      while (p >= 0 && /\s/.test(src[p])) p--;
      const prev = p >= 0 ? src[p] : "";
      const word = /([A-Za-z_$]+)$/.exec(src.slice(Math.max(0, p - 10), p + 1));
      const isRe = !prev || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) ||
        (word && /^(return|typeof|case|in|of|void|delete|throw|new|else|do)$/.test(word[1]));
      if (isRe) {
        let j = i + 1, cls = false;
        while (j < n) {
          const ch = src[j];
          if (ch === "\\") { j += 2; continue; }
          if (ch === "\n") break;
          if (ch === "[") cls = true;
          else if (ch === "]") cls = false;
          else if (ch === "/" && !cls) break;
          j++;
        }
        i = j + 1;
        while (i < n && /[a-z]/i.test(src[i])) i++;
        continue;
      }
    }
    i++;
  }
  return out;
}

// แตกข้อความ (อาจมีแท็ก HTML / ${} / |) เป็นชิ้น ๆ ที่จะไปเป็น text node จริง
function pieces(text, { pipe = false } = {}) {
  const res = [];
  for (const m of text.matchAll(ATTR_RE)) {
    const v = decodeEnt(m[3] ?? m[4] ?? "");
    if (TH.test(v)) res.push(norm(v));
  }
  const parts = text.split(/<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|\u0001|\n/);
  for (let p of parts) {
    p = decodeEnt(p);
    for (let q of pipe ? p.split(/[|\t]/) : [p]) {
      q = norm(q);
      if (q && TH.test(q)) res.push(q);
    }
  }
  return res;
}

function walkJson(v, acc) {
  if (typeof v === "string") { if (TH.test(v)) acc.push(v); }
  else if (Array.isArray(v)) v.forEach((x) => walkJson(x, acc));
  else if (v && typeof v === "object") for (const k in v) { if (TH.test(k)) acc.push(k); walkJson(v[k], acc); }
}

function fromJs(src, { data = false } = {}) {
  const out = [];
  for (const lit of jsStrings(src)) {
    if (!TH.test(lit.s)) continue;
    const t = lit.s.trim();
    if (data && (t[0] === "{" || t[0] === "[") && t.length > 20) {
      try {
        const acc = [];
        walkJson(JSON.parse(t), acc);
        acc.forEach((s) => pieces(s, { pipe: true }).forEach((k) => out.push({ k, at: lit.at })));
        continue;
      } catch (_) { /* ไม่ใช่ JSON */ }
    }
    pieces(lit.s, { pipe: data }).forEach((k) => out.push({ k, at: lit.at }));
  }
  return out;
}

function fromHtml(src) {
  const out = [];
  const body = src.replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));
  // สคริปต์ในหน้า
  for (const m of body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(m[1]) || /ld\+json|importmap/.test(m[1])) continue;
    const base = m.index + m[0].indexOf(">") + 1;
    for (const r of fromJs(m[2])) out.push({ k: r.k, at: base + r.at });
  }
  const noScript = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => " ".repeat(m.length))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (m) => " ".repeat(m.length));
  // แอตทริบิวต์ที่แสดงผล + โค้ดใน onclick ฯลฯ
  for (const m of noScript.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const tag = m[0];
    for (const a of tag.matchAll(ATTR_RE)) {
      const v = norm(decodeEnt(a[3] ?? a[4] ?? ""));
      if (TH.test(v)) out.push({ k: v, at: m.index });
    }
    if (/^<input\b/i.test(tag) && /type\s*=\s*["']?(button|submit|reset)/i.test(tag)) {
      const v = /\svalue\s*=\s*"([^"]*)"/i.exec(tag);
      if (v && TH.test(v[1])) out.push({ k: norm(decodeEnt(v[1])), at: m.index });
    }
    for (const h of tag.matchAll(/\son[a-z]+\s*=\s*"([^"]*)"/gi)) {
      for (const r of fromJs(decodeEnt(h[1]))) out.push({ k: r.k, at: m.index });
    }
  }
  // ข้อความระหว่างแท็ก
  for (const m of noScript.matchAll(/>([^<]+)</g)) {
    const v = norm(decodeEnt(m[1]));
    if (v && TH.test(v)) out.push({ k: v, at: m.index + 1 + m[1].search(/\S/) });
  }
  return out;
}

// ข้อความไทยใน CSS content:"..." (แปลด้วย DOM ไม่ได้ ต้องเขียน CSS ทับเอง)
function cssContent(src) {
  const out = [];
  for (const m of src.matchAll(/content\s*:\s*(["'])((?:(?!\1).)*)\1/g)) if (TH.test(m[2])) out.push(m[2]);
  return out;
}

function ctxAt(src, at, len = 70) {
  const a = Math.max(0, at - len), b = Math.min(src.length, at + len);
  return src.slice(a, b).replace(/\s+/g, " ").trim();
}

function extractFile(rel, { data = false } = {}) {
  const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
  if (!TH.test(src)) return { src, items: [] };
  const items = rel.endsWith(".html") ? fromHtml(src) : fromJs(src, { data });
  return { src, items };
}

// อ่าน/เขียนไฟล์ชุดคำแปล i18n/en/<name>.js  —  MDI18N.add("name",{"d":{...},"p":[...],"w":1});
function readBundle(name) {
  const f = path.join(OUT_EN, name + ".js");
  if (!fs.existsSync(f)) return null;
  const s = fs.readFileSync(f, "utf8");
  const a = s.indexOf(",{"), b = s.lastIndexOf("});");
  return JSON.parse(s.slice(a + 1, b + 1));
}
function writeBundle(name, payload, header) {
  fs.mkdirSync(OUT_EN, { recursive: true });
  const keys = Object.keys(payload.d);
  let body = "/* " + header + " */\nMDI18N.add(" + JSON.stringify(name) + ",{\"d\":{\n";
  body += keys.map((k) => JSON.stringify(k) + ":" + JSON.stringify(payload.d[k])).join(",\n");
  body += "\n}";
  if (payload.p && payload.p.length) body += ",\"p\":[\n" + payload.p.map((x) => JSON.stringify(x)).join(",\n") + "\n]";
  if (payload.w) body += ",\"w\":1";
  body += "});\n";
  fs.writeFileSync(path.join(OUT_EN, name + ".js"), body);
}

module.exports = { ROOT, WORK, OUT_EN, TH, norm, glob, extractFile, cssContent, ctxAt, readBundle, writeBundle, decodeEnt, jsStrings, pieces };
