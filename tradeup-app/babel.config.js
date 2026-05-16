module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.ts', '.tsx'],
        alias: {
          '@decorators': './src/decorators',
          '@configs': './src/configs',
          '@lib': './src/lib',
          '@hooks': './src/hooks',
          '@errors': './src/errors',
          '@typings': './src/types',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
