module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
  plugins: [
    '@babel/plugin-transform-object-rest-spread',
    '@babel/plugin-transform-runtime',
    // [
    //   'transform-imports',
    //   {
    //     '@patternfly/react-icons': {
    //       transform: (importName) =>
    //         `@patternfly/react-icons/dist/js/icons/${importName
    //           .split(/(?=[A-Z])/)
    //           .join('-')
    //           .toLowerCase()}`,
    //       preventFullImport: true,
    //     },
    //   },
    //   'react-icons',
    // ],
  ],
};
