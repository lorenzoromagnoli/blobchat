const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const site = {
  entry: {
    "index": './src/index.js',
    "in_shape/index": './src/in_shape/index.js',
    "bubbly_heads/index": './src/bubbly_heads/index.js',
  },
  // Updated to use exact pattern match for webpack 5
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9000,
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['index'],
      filename: 'index.html',
      template: './src/index.html'
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['in_shape/index'],
      filename: './in_shape/index.html',
      template: './src/in_shape/index.html'
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['bubbly_heads/index'],
      filename: './bubbly_heads/index.html',
      template: './src/bubbly_heads/index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/assets/3dModels', to: '3dModels' },
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [{
      test: /\.s[ac]ss$/i,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
      ],
    },
    {
      test: /\.(png|svg|jpg|gif)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'images/[hash][ext][query]'
      }
    }]
  }
}

module.exports = [site];