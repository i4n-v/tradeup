module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
    ['module:react-native-dotenv'],
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: {
          '@': './src',
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
