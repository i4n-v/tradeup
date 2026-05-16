const rnPreset = require('@react-native/jest-preset');

module.exports = {
  ...rnPreset,
  // Metro skips Babel on most node_modules; css-interop ships JSX in .js and must be transformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-css-interop|nativewind)/)',
  ],
  moduleNameMapper: {
    ...rnPreset.moduleNameMapper,
    '^@decorators/(.*)$': '<rootDir>/src/decorators/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    '^@typings/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '\\.css$': '<rootDir>/__mocks__/emptyModule.js',
  },
};
