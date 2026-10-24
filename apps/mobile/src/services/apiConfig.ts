export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    // Split dev mode: when client is opened directly on port 8680
    if (window.location.port === '8680') {
      return `http://${window.location.hostname}:8682`;
    }
    // Production / GoDaddy hosting or unified server
    return window.location.origin;
  }
  return 'http://localhost:8682';
};
