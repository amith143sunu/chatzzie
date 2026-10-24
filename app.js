/**
 * Chatzie Production Unified Server
 *
 * Designed for single-port deployments (GoDaddy Node.js Hosting / Phusion Passenger / Production)
 * Serves:
 *  1. Express Backend REST API & Agora Token Generator at `/api/*`
 *  2. Real-Time Socket.IO Signaling Engine at `/socket.io/*`
 *  3. Admin Backoffice Portal (Next.js) at `/admin/*` and `/_next/*`
 *  4. Client Web App (Expo React Native Web) statically at `/` with SPA routing fallback
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables (.env at root or server/.env)
if (fs.existsSync(path.join(__dirname, '.env'))) {
  dotenv.config({ path: path.join(__dirname, '.env') });
} else if (fs.existsSync(path.join(__dirname, 'server/.env'))) {
  dotenv.config({ path: path.join(__dirname, 'server/.env') });
}

// 1. Import backend Express app and HTTP server (with Socket.IO pre-attached)
const { app, server, io } = require('./server/dist/index.js');

const PORT = process.env.PORT ? (isNaN(Number(process.env.PORT)) ? process.env.PORT : Number(process.env.PORT)) : 3000;
const clientDist = path.join(__dirname, 'apps/mobile/dist');
const webAdminDir = path.join(__dirname, 'apps/web-admin');

// 2. Client Web App (Expo React Native Web) Setup
if (fs.existsSync(clientDist)) {
  console.log('[Chatzie] Mounting Mobile & Desktop Web App from:', clientDist);

  // Static assets
  app.use(
    express.static(clientDist, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    })
  );

  // Handle Expo dynamic bundle fallback if cached version requested
  app.get('/_expo/static/js/web/*', (req, res, next) => {
    const reqPath = req.url.split('?')[0];
    const filePath = path.join(clientDist, reqPath);
    if (!fs.existsSync(filePath)) {
      const jsDir = path.join(clientDist, '_expo/static/js/web');
      if (fs.existsSync(jsDir)) {
        const files = fs.readdirSync(jsDir);
        const activeBundle = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
        if (activeBundle) {
          return res.sendFile(path.join(jsDir, activeBundle));
        }
      }
    }
    next();
  });
} else {
  console.warn('[Chatzie] Client web build not found at apps/mobile/dist. Run: npm run build');
}

// 3. Next.js Admin App Setup (Prepared asynchronously)
let adminHandler = null;
try {
  const next = require('next');
  const adminApp = next({
    dev: false,
    dir: webAdminDir,
    quiet: false,
  });
  console.log('[Chatzie] Warming up Next.js Admin Backoffice in background...');
  adminApp
    .prepare()
    .then(() => {
      adminHandler = adminApp.getRequestHandler();
      console.log('[Chatzie] Next.js Admin Backoffice ready.');
    })
    .catch((err) => {
      console.warn('[Chatzie] Notice: Next.js admin app background warm-up:', err.message);
    });

  // Route Admin requests to Next.js handler
  const handleAdminRequest = (req, res) => {
    if (adminHandler) {
      return adminHandler(req, res);
    }
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Admin Backoffice Starting</title><meta http-equiv="refresh" content="3"></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 90vh; text-align: center; background: #0f172a; color: white;">
          <div>
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">Admin Backoffice Initializing...</div>
            <div style="font-size: 14px; color: #94a3b8;">Loading management portal. Page will automatically refresh in 3 seconds.</div>
          </div>
        </body>
      </html>
    `);
  };

  app.all('/admin', handleAdminRequest);
  app.all('/admin/*', handleAdminRequest);
  app.all('/_next/*', handleAdminRequest);
} catch (err) {
  console.warn('[Chatzie] Warning: Could not initialize Next.js admin app:', err.message);
}

// 4. SPA fallback for client routes
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/admin') ||
    req.path.startsWith('/_next') ||
    req.path.startsWith('/socket.io')
  ) {
    return next();
  }
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    res.sendFile(path.join(clientDist, 'index.html'));
  } else {
    res.status(200).send('<h1>Chatzie Backend Live</h1><p>Client assets not found. Run npm run build.</p>');
  }
});

// 5. Start HTTP Server immediately on PORT (binds instantly for cloud health check)
server.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log('  Chatzie Production Server is LIVE');
  console.log(`  - Port:              ${PORT}`);
  console.log(`  - Client Web App:    http://0.0.0.0:${PORT}/`);
  console.log(`  - Admin Portal:      http://0.0.0.0:${PORT}/admin`);
  console.log(`  - REST API Engine:   http://0.0.0.0:${PORT}/api/config`);
  console.log('====================================================');
});
