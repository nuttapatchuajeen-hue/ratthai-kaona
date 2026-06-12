// static file server for the รวมงานเว็บ md site (root = parent folder, so ../js etc. work)
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PORT = 4599;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/' || rel === '') { res.writeHead(302, { Location: '/election/' }); res.end(); return; }
  if (rel.endsWith('/')) rel += 'index.html';
  const fp = path.normalize(path.join(ROOT, rel));
  if (!fp.startsWith(path.normalize(ROOT))) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(fp, (e, buf) => {
    if (e) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('not found: ' + rel); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('serving รวมงานเว็บ md/ on http://localhost:' + PORT + ' (/ → election/)'));
