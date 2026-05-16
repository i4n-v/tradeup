module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-css-interop|nativewind)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
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
