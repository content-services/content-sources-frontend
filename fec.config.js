module.exports = {
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  interceptChromeConfig: true,
  appUrl: '/apps/content-sources',
  routes: {
    '/api/content_sources/': { host: 'http://localhost:8000' },
  },
  /**
   * Add additional webpack plugins
   */
  plugins: [],
};
