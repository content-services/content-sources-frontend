module.exports = {
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  interceptChromeConfig: true,
  sassPrefix: '.contentSources',
  appUrl: '/insights/content',
  routes: {
    '/api/content-sources/': { host: 'http://localhost:8000' },
  },
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [{ 'react-router-dom': { singleton: true } }],
  },
};
