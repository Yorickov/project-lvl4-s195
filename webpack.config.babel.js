import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';

export default () => ({
  entry: {
    app: ['./client'],
    vendor: ['babel-polyfill', 'jquery', 'jquery-ujs', 'popper.js', 'bootstrap'],
  },
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: '[name].js',
    publicPath: '/assets/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 1 },
          },
          {
            loader: 'postcss-loader',
            options: { plugins: () => [autoprefixer()] },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
});
