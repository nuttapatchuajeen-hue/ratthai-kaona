/* ══════════════════════════════════════════════════════════════════════
   build-standalone.js — ประกอบ standalone.html จากไฟล์แยก
   วิธีใช้:  node build-standalone.js
   เอา style.css ไปแทน <link> และเอา .js แต่ละไฟล์ไปแทน <script src>
   ตามลำดับเดิม (ไฟล์ปลายทางต้องเทียบเท่า index.html แบบรวมร่าง)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');

function once(hay, needle, what) {
  const n = hay.split(needle).length - 1;
  if (n !== 1) throw new Error(`ต้องพบ "${what}" หนึ่งครั้ง แต่พบ ${n} ครั้ง`);
}

let html = read('index.html');

// ตัดบล็อกที่ผูกกับเว็บแม่ออก (เสียง/เมนู) — ไฟล์เดียวจบต้องไม่พึ่งไฟล์อื่นเลย
const siteOnly = /[ \t]*<!-- md:site-only:start[\s\S]*?md:site-only:end -->\r?\n?/g;
const cut = (html.match(siteOnly) || []).length;
html = html.replace(siteOnly, '');

const cssTag = '<link rel="stylesheet" href="style.css">';
once(html, cssTag, cssTag);
html = html.replace(cssTag, '<style>\n' + read('style.css') + '\n</style>');

for (const f of ['data.js', 'stars.js', 'constellations.js', 'deep.js', 'exo.js', 'textures.js', 'app.js']) {
  const tag = `<script src="${f}"></script>`;
  once(html, tag, tag);
  html = html.replace(tag, '<script>\n' + read(f) + '\n</script>');
}

fs.writeFileSync(path.join(dir, 'standalone.html'), html);
const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(0);
console.log(`standalone.html เขียนแล้ว · ${kb} KB · ${html.split('\n').length} บรรทัด · ตัดบล็อกเว็บแม่ ${cut} บล็อก`);
