// static file server for the เลือกตั้ง69/ multi-page site
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'เลือกตั้ง69');
const PORT = 4599;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  const fp = path.join(ROOT, rel);
  if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(fp, (e, buf) => {
    if (e) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('not found: ' + rel); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('serving เลือกตั้ง69/ on http://localhost:' + PORT));
