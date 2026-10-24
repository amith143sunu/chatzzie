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

const PORT = process.env.PORT || 8682;
const clientDist = path.join(__dirname, 'apps/mobile/dist');
const webAdminDir = path.join(__dirname, 'apps/web-admin');

async function bootstrap() {
  // 2. Next.js Admin App Setup
  let adminHandler = null;
  try {
    const next = require('next');
    const adminApp = next({
      dev: false,
      dir: webAdminDir,
      quiet: false,
    });
    console.log('[Chatzie] Preparing Next.js Admin Backoffice...');
    await adminApp.prepare();
    adminHandler = adminApp.getRequestHandler();
    console.log('[Chatzie] Next.js Admin Backoffice ready.');

    // Route Admin requests to Next.js handler
    app.all('/admin', (req, res) => adminHandler(req, res));
    app.all('/admin/*', (req, res) => adminHandler(req, res));
    app.all('/_next/*', (req, res) => adminHandler(req, res));
  } catch (err) {
    console.warn('[Chatzie] Warning: Could not initialize Next.js admin app:', err.message);
  }

  // 3. Client Web App (Expo React Native Web) Setup
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

    // SPA fallback: any GET request not handled by /api, /admin, /_next, /socket.io goes to index.html
    app.get('*', (req, res, next) => {
      if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/admin') ||
        req.path.startsWith('/_next') ||
        req.path.startsWith('/socket.io')
      ) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    console.warn('[Chatzie] Client web build not found at apps/mobile/dist. Run: npm run build');
  }

  // 4. Start HTTP Server on GoDaddy assigned PORT
  const listenPort = process.env.PORT ? (isNaN(Number(process.env.PORT)) ? process.env.PORT : Number(process.env.PORT)) : 8682;
  server.listen(listenPort, '0.0.0.0', () => {
    console.log('====================================================');
    console.log('  Chatzie Production Server is LIVE');
    console.log(`  - Port:              ${listenPort}`);
    console.log(`  - Client Web App:    http://0.0.0.0:${listenPort}/`);
    console.log(`  - Admin Portal:      http://0.0.0.0:${listenPort}/admin`);
    console.log(`  - REST API Engine:   http://0.0.0.0:${listenPort}/api/config`);
    console.log('====================================================');
  });
}

bootstrap().catch((err) => {
  console.error('[Chatzie] Fatal error during startup:', err);
  process.exit(1);
});
