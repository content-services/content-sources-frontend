/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const { dependencies, insights } = require('./package.json');

const moduleName = insights.appname.replace(/-(\w)/g, (_, match) => match.toUpperCase());
const srcDir = path.resolve(__dirname, './src');
const fileRegEx = /\.(png|woff|woff2|eot|ttf|svg|gif|jpe?g|png)(\?[a-z0-9=.]+)?$/;
const stats = {
  excludeAssets: fileRegEx,
  colors: true,
  modules: false,
};

// Show what files changed since last compilation
class WatchRunPlugin {
  apply(compiler) {
    compiler.hooks.watchRun.tap('WatchRun', (comp) => {
      if (comp.modifiedFiles) {
        const changedFiles = Array.from(comp.modifiedFiles, (file) => `\n  ${file}`).join('');
        const logger = compiler.getInfrastructureLogger(insights.appname);
        logger.info('===============================');
        logger.info('FILES CHANGED:', changedFiles);
        logger.info('===============================');
      }
    });
  }
}

module.exports = {
  appUrl: '/insights/content/repositories',
  debug: true,
  interceptChromeConfig: false,
  proxyVerbose: true,
  sassPrefix: `.${moduleName}`,
  stats,
  useCache: true,
  useProxy: true,
  moduleFederation: {
    moduleName,
    // exclude: ['react-router-dom'],
    exposes: {
      './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
    },
    shared: [
    //   { 'react-redux': { version: dependencies['react-redux'] } },
      {
        'react-router-dom': {
          version: dependencies['react-router-dom'],
          import: false,
          singleton: true,
        },
      },
      {
        '@unleash/proxy-client-react': {
          version: dependencies['@unleash/proxy-client-react'],
          singleton: true,
        },
      },
    ],
  },
  /**
   * Add additional webpack plugins
   */
  plugins: [...(process.env.VERBOSE ? [new WatchRunPlugin()] : []), new webpack.ProgressPlugin()],
  resolve: {
    modules: [srcDir, path.resolve(__dirname, './node_modules')],
  },
  routes: {
    ...(process.env.BACKEND_PORT && {
      '/api/content-sources/': {
        host: `http://localhost:${process.env.BACKEND_PORT}`,
      },
    }),
  },
};

// OLD CONFIG
// module.exports = {
//   debug: true,
//   useProxy: true,
//   proxyVerbose: true,
//   interceptChromeConfig: true,
//   sassPrefix: '.contentSources',
//   appUrl: '/insights/content',
//   routes: {
//     '/api/content-sources/': { host: 'http://localhost:8000' },
//   },
//   /**
//    * Add additional webpack plugins
//    */
//   plugins: [],
//   moduleFederation: {
//     exclude: ['react-router-dom'],
//     shared: [{ 'react-router-dom': { singleton: true, import: false, version: '^6.3.0' } }],
//   },
// };
