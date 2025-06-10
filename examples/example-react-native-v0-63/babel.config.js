const path = require('path');
const utilsPackage = require('../../package.json');

module.exports = {
  presets: [
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          [utilsPackage.name]: path.join(__dirname, '../..', utilsPackage.source),
        },
      },
    ],
  ],
};
