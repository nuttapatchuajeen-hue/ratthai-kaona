# โมเดลยานอวกาศ

ไฟล์ `.glb` ในโฟลเดอร์นี้เป็นโมเดลสามมิติที่ **NASA เผยแพร่ให้ใช้ได้** — หน้า 3D Resources ของ science.nasa.gov
และคลัง GitHub ทางการ `nasa/NASA-3D-Resources` (ชุดเดียวกัน) ใช้กับยาน 8 ลำ

| ไฟล์ | ใช้กับ | ต้นทาง | เครดิตตามหน้าต้นทาง | ขนาด |
|---|---|---|---|---|
| `voyager.glb` | วอยเอเจอร์ 1 · 2 | https://science.nasa.gov/resource/voyager-3d-model/ | NASA VTAD | 155 KB |
| `new-horizons.glb` | นิวฮอไรซันส์ | https://science.nasa.gov/resource/new-horizons-3d-model/ | NASA VTAD | 109 KB |
| `parker.glb` | พาร์เกอร์ โซลาร์ โพรบ | https://science.nasa.gov/resource/parker-solar-probe-3d-model/ | NASA VTAD | 233 KB |
| `pioneer.glb` | ไพโอเนียร์ 10 · 11 | https://science.nasa.gov/3d-resources/pioneer/ | NASA (หน้าไม่ระบุหน่วยย่อย) | 96 KB |
| `jwst.glb` | กล้องเจมส์ เว็บบ์ | https://github.com/nasa/NASA-3D-Resources — `James Webb Space Telescope (B)` · หน้า https://science.nasa.gov/resource/james-webb-space-telescope/ | NASA | 365 KB |
| `europa-clipper.glb` | ยูโรปาคลิปเปอร์ | https://science.nasa.gov/resource/europa-clipper-3d-model/ | NASA VTAD | 1,298 KB |

VTAD = NASA Visualization Technology Applications and Development

**ลูซีกับไซคี** NASA ไม่ได้เผยแพร่โมเดล (ค้นทั้ง science.nasa.gov และคลัง GitHub ของ NASA เมื่อ ก.ย. 2569)
จึงยังใช้โมเดลที่ปั้นด้วยโค้ดใน `craftModel()`

## ย่อไฟล์ยังไง

ต้นฉบับเป็นโมเดลความละเอียดสูง (1–34 MB) ย่อด้วย `@gltf-transform` + `draco3d`:
เชื่อมจุดซ้ำ · พื้นผิว WebP 512 px · ตัดของที่ไม่ใช้ · **บีบรูปทรงแบบ Draco**
รูปทรงยังครบทุกสามเหลี่ยม (ยูโรปาคลิปเปอร์ 34 MB → 1.3 MB · 203,662 สามเหลี่ยม)

ไฟล์ที่บีบแบบ Draco ต้องมีตัวถอดรหัส หน้าเว็บจึงโหลด `DRACOLoader` กับตัวถอดรหัส (~350 KB)
จาก jsDelivr **เฉพาะตอนเจาะจงยานที่มีโมเดลครั้งแรก**

## ทิศของโมเดล

แต่ละไฟล์วางแกนไม่เหมือนกัน ค่า `rot` ใน `GLTF_SRC` (app.js) หมุนให้ด้านที่ต้องหันเข้าเป้าหมายมาอยู่ทาง +Z
(จานสื่อสาร → โลก · โล่กันความร้อน ม่านกันแดด แผงโซลาร์ → ดวงอาทิตย์)
ตรวจจากทิศเฉลี่ยของผิว (NORMAL) กับตำแหน่งจานเทียบตัวยาน แล้วดูภาพที่มองจากทิศเป้าหมายตรง ๆ ทุกไฟล์
ถ้าเปลี่ยนไฟล์ ต้องตรวจทิศใหม่ทุกครั้ง

## เงื่อนไขการใช้

เนื้อหาของ NASA โดยทั่วไปไม่มีลิขสิทธิ์และใช้เพื่อการศึกษาได้ ดูเงื่อนไขที่ https://science.nasa.gov/3d-resources/
**ไม่ได้ใช้ตราสัญลักษณ์ของ NASA** ซึ่งได้รับความคุ้มครองแยกต่างหากในฐานะเครื่องหมาย

โมเดลเหล่านี้ **โหลดเมื่อผู้ใช้เจาะจงยานลำนั้นเท่านั้น** ถ้าโหลดไม่ได้
(เช่นเปิด `standalone.html` แบบไฟล์เดียวจากที่อื่น หรือออฟไลน์) จะใช้โมเดลที่ปั้นด้วยโค้ดแทนโดยอัตโนมัติ
