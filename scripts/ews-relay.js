/**
 * scripts/ews-relay.js — เครื่องถ่ายทอดธงเตือนภัยของกรมทรัพยากรน้ำ (ews.dwr.go.th) ขึ้นเว็บจริง
 *
 * ทำไม: ews.dwr.go.th ไม่ตอบเซิร์ฟเวอร์นอกประเทศ (Vercel ทั้งสหรัฐฯ และสิงคโปร์ = ETIMEDOUT)
 *       แต่ตอบเครื่องในไทยได้ปกติ → ให้เครื่องในไทยดึงชุดเดียวกับ /api/warn แล้วดันขึ้น branch "ews-data"
 *       ของเรโป · /api/warn อ่าน raw.githubusercontent.com/…/ews-data/ews.json เมื่อดึงตรงไม่ได้ (ไม่เกิน 2 ชม.)
 *
 * ใช้:  node scripts/ews-relay.js          ดึง + commit + push (branch ews-data มี commit เดียวเสมอ: amend + force)
 *       node scripts/ews-relay.js --dry    ดึงแล้วเขียนไฟล์อย่างเดียว ไม่แตะ git
 * ตั้งเวลา: Windows Task Scheduler ทุก 15 นาที (ดู scripts/ews-relay-task.ps1) — ทำงานเฉพาะตอนเครื่องเปิด
 *
 * ⚠ branch ews-data มี vercel.json ของตัวเองที่ปิด deploy (git.deploymentEnabled=false) — Vercel อ่านจาก commit ของ branch นั้น
 *   ไม่งั้น push ทุก 15 นาทีจะกินโควตา deploy (main ก็ตั้ง deploymentEnabled.ews-data=false ไว้ซ้ำอีกชั้น)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const WT = path.resolve(REPO, '..', '.ews-relay');          // worktree ของ branch ews-data (นอกโฟลเดอร์เว็บ)
const BRANCH = 'ews-data';
const DRY = process.argv.includes('--dry');
// ews.dwr.go.th บางช่วงตอบช้าเกิน 25 วินาที — เครื่องถ่ายทอดไม่รีบ ให้รอได้ถึง 90 วินาที
process.env.EWS_TIMEOUT_MS = process.env.EWS_TIMEOUT_MS || '90000';

function git(args, cwd) { return execFileSync('git', args, { cwd: cwd || REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
function log(s) { console.log(new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 19).replace('T', ' ') + '  ' + s); }   // เวลาไทย

function ensureWorktree() {
  if (fs.existsSync(path.join(WT, '.git'))) return;
  const hasLocal = git(['branch', '--list', BRANCH]) !== '';
  let hasRemote = false;
  try { hasRemote = git(['ls-remote', '--heads', 'origin', BRANCH]) !== ''; } catch (e) { }
  if (hasLocal) git(['worktree', 'add', WT, BRANCH]);
  else if (hasRemote) { git(['fetch', 'origin', BRANCH + ':' + BRANCH]); git(['worktree', 'add', WT, BRANCH]); }
  else git(['worktree', 'add', '--orphan', '-b', BRANCH, WT]);
  log('สร้าง worktree ' + WT);
}

(async () => {
  const { ewsBundle } = require(path.join(REPO, 'api', 'warn.js'));
  const t0 = Date.now();
  const b = await ewsBundle();
  const body = JSON.stringify(b);
  log('ดึงได้ ' + b.total + ' สถานี · กำลังเตือน ' + b.st.length + ' · ประวัติ ' + b.hist.length + ' · ' + body.length + ' ไบต์ · ' + (Date.now() - t0) + ' ms');
  if (DRY) {
    const out = path.join(REPO, '..', 'ews-relay-dry.json');
    fs.writeFileSync(out, body);
    log('--dry: เขียน ' + out + ' (ไม่แตะ git)');
    return;
  }
  ensureWorktree();
  fs.writeFileSync(path.join(WT, 'ews.json'), body);
  fs.writeFileSync(path.join(WT, 'README.md'),
    '# ews-data\n\nไฟล์ข้อมูลอัตโนมัติ — ธงเตือนภัยจากระบบเตือนภัยล่วงหน้า กรมทรัพยากรน้ำ (ews.dwr.go.th)\n' +
    'ดึงจากเครื่องในไทยด้วย `scripts/ews-relay.js` บน branch main แล้วให้ `/api/warn` อ่านต่อ เพราะกรมฯ ไม่ตอบเซิร์ฟเวอร์นอกประเทศ\n\n' +
    'branch นี้มี commit เดียวเสมอ (amend + force push) — ห้าม merge เข้า main\n');
  // Vercel อ่าน vercel.json จาก commit ของ branch ที่ถูก push เอง (ไม่ใช่ของ main) → ปิด deploy ไว้ใน branch นี้ด้วย
  // ไม่งั้น push ทุก 15 นาที = deploy ตัวอย่างวันละ ~96 ครั้ง (เกินโควตา Hobby 100/วัน แล้ว deploy ของ main จะติด)
  fs.writeFileSync(path.join(WT, 'vercel.json'), JSON.stringify({ git: { deploymentEnabled: false } }, null, 2) + '\n');
  git(['add', 'ews.json', 'README.md', 'vercel.json'], WT);
  const msg = 'ews: ' + new Date(b.at + 7 * 3600000).toISOString().slice(0, 16).replace('T', ' ') + ' (เวลาไทย) · เตือน ' + b.st.length + ' สถานี';
  let hasHead = true;
  try { git(['rev-parse', '--verify', 'HEAD'], WT); } catch (e) { hasHead = false; }
  git(hasHead ? ['commit', '--amend', '-m', msg] : ['commit', '-m', msg], WT);
  git(['push', '--force', 'origin', BRANCH], WT);
  log('push แล้ว: ' + msg);
})().catch(e => { log('ล้มเหลว: ' + (e && e.message || e)); process.exitCode = 1; });
