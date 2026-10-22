const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8680;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let filePath = path.join(DIST_DIR, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // If it's a request for an expo js bundle with an old/different hash, serve the active bundle
    if (reqPath.includes('/_expo/static/js/web/index-')) {
      const jsDir = path.join(DIST_DIR, '_expo/static/js/web');
      if (fs.existsSync(jsDir)) {
        const activeBundle = fs.readdirSync(jsDir).find(f => f.startsWith('index-') && f.endsWith('.js'));
        if (activeBundle) {
          filePath = path.join(jsDir, activeBundle);
        }
      }
    } else if (reqPath.endsWith('.js') || reqPath.endsWith('.css') || reqPath.endsWith('.map') || reqPath.endsWith('.ico')) {
      // Never serve HTML for missing asset files (prevents SyntaxError: Unexpected token '<')
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    } else {
      filePath = path.join(DIST_DIR, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Chatzie Mobile Web App running at:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - IPv4:    http://127.0.0.1:${PORT}`);
});
