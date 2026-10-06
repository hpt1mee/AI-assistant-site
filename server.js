import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('./', import.meta.url);
const port = Number(process.env.PORT || 8080);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const files = new Set(['index.html', 'style.css', 'site.js', 'account.html', 'account.css', 'account.js']);
for (const entry of await readdir(new URL('assets/', root), { withFileTypes: true })) {
  if (entry.isFile()) files.add(`assets/${entry.name}`);
}
const types = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', png: 'image/png', svg: 'image/svg+xml' };

http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end(); return; }
  if (route === '/health') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end(req.method === 'HEAD' ? undefined : 'ok'); return; }
  if (['/account', '/account/'].includes(route)) { res.writeHead(308, { Location: '/account.html' }); res.end(); return; }
  const file = route === '/' ? 'index.html' : route.slice(1);
  if (!files.has(file)) { res.writeHead(404); res.end(); return; }
  try {
    const body = await readFile(fileURLToPath(new URL(file, root)));
    res.writeHead(200, {
      'Content-Type': types[file.split('.').pop()] || 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css') ? 'no-cache' : 'public, max-age=86400',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(500); res.end(); }
}).listen(port, '0.0.0.0', () => console.log(`AI Assistant website listening on ${port}`));
