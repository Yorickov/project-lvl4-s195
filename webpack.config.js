const path = require('path');
const webpack = require('webpack');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: ['./client'],
  output: {
    path: path.join(__dirname, 'public', 'assets'),
    filename: '[name].bundle.js',
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
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: { plugins: () => [precss, autoprefixer] },
          },
          {
            loader: 'sass-loader',
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
    new CopyWebpackPlugin([
      { from: 'client/images/', to: 'images' },
    ]),
    new HtmlWebpackPlugin({
      template: 'template.html',
      favicon: 'client/images/favicon.ico',
    }),
  ],
};

