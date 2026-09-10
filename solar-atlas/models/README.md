# โมเดลยานอวกาศ

ไฟล์ `.glb` ในโฟลเดอร์นี้เป็นโมเดลสามมิติที่ **NASA เผยแพร่ให้ใช้ได้**
ต้นทางคือหน้า 3D Resources ของ science.nasa.gov

| ไฟล์ | ต้นทาง |
|---|---|
| `voyager.glb` | https://science.nasa.gov/resource/voyager-3d-model/ |
| `new-horizons.glb` | https://science.nasa.gov/resource/new-horizons-3d-model/ |
| `parker.glb` | https://science.nasa.gov/resource/parker-solar-probe-3d-model/ |

ไฟล์ต้นฉบับเป็นโมเดลความละเอียดสูง (3–6 MB) จึงย่อลงก่อนใช้บนเว็บด้วย
`@gltf-transform` — เชื่อมจุดซ้ำ ลดพื้นผิวเหลือ 512 พิกเซลแบบ WebP และตัดของที่ไม่ถูกใช้
เหลือไฟล์ละ 0.3–1.4 MB โดยรูปทรงยังครบ

**เครดิต** โมเดลโดย NASA Visualization Technology Applications and Development (VTAD) ตามที่ระบุในหน้าต้นทางทั้งสามหน้า — เนื้อหาของ NASA โดยทั่วไปไม่มีลิขสิทธิ์และใช้เพื่อ
การศึกษาได้ ดูเงื่อนไขที่ https://science.nasa.gov/3d-resources/
**ไม่ได้ใช้ตราสัญลักษณ์ของ NASA** ซึ่งได้รับความคุ้มครองแยกต่างหากในฐานะเครื่องหมาย

โมเดลเหล่านี้ **โหลดเมื่อผู้ใช้เจาะจงยานลำนั้นเท่านั้น** ถ้าโหลดไม่ได้
(เช่นเปิด `standalone.html` แบบไฟล์เดียวจากที่อื่น) จะใช้โมเดลที่ปั้นด้วยโค้ดแทนโดยอัตโนมัติ
