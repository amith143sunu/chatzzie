const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../apps/mobile/dist/index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Mobile zero-latency viewport
  html = html.replace(
    /<meta\s+name=["']viewport["'][^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />'
  );

  // 2. Mobile touch-action & 100dvh reset
  const touchReset = `
    <style id="mobile-touch-reset">
      html, body {
        height: 100%;
        height: 100dvh;
        margin: 0;
        padding: 0;
        -webkit-overflow-scrolling: touch;
        touch-action: manipulation;
      }
      body {
        overflow: hidden;
        overscroll-behavior-y: none;
      }
      #root {
        display: flex;
        height: 100%;
        height: 100dvh;
        width: 100%;
        flex: 1;
      }
      * {
        -webkit-tap-highlight-color: transparent;
      }
      button, [role="button"], a {
        cursor: pointer;
        touch-action: manipulation;
      }
    </style>
  `;

  if (!html.includes('id="mobile-touch-reset"')) {
    html = html.replace('</head>', `${touchReset}</head>`);
  }

  // 3. Agora RTC script
  if (!html.includes('AgoraRTC_N.js')) {
    html = html.replace('</body>', '<script src="/AgoraRTC_N.js"></script></body>');
  }

  fs.writeFileSync(htmlPath, html);
  console.log('[Chatzie] Successfully optimized mobile HTML with zero-latency touch and 100dvh viewport.');
}
