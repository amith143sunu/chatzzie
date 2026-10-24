export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    // Local dev mode: Next.js admin running separately on port 8681
    if (window.location.port === '8681') {
      return `http://${window.location.hostname}:8682`;
    }
    // Single-port unified server (app.js) or GoDaddy domain hosting
    return window.location.origin;
  }
  return 'http://localhost:8682';
};
