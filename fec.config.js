module.exports = {
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  interceptChromeConfig: true,
  appUrl: '/insights/content',
  routes: {
    '/api/content-sources/': { host: 'http://localhost:8000' },
  },
  /**
   * Add additional webpack plugins
   */
  plugins: [],
};
