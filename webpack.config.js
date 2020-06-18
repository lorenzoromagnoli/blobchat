const path = require( 'path' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const CopyPlugin = require( 'copy-webpack-plugin' );


//this packs the index using the appropriate template
const site = {
  entry: {
    "index": './src/index.js',
    "in_shape/index": './src/in_shape/index.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 9000
  },
  plugins: [
    new CleanWebpackPlugin( { cleanStaleWebpackAssets: false } ),
    new HtmlWebpackPlugin( {
      inject: true,
      chunks: [ 'index' ],
      filename: 'index.html',
      template: './src/index.html'
    } ),
    new HtmlWebpackPlugin( {
      inject: true,
      chunks: [ 'in_shape/index' ],
      filename: './in_shape/index.html',
      template: './src/in_shape/index.html'
    } ),
    new CopyPlugin( {
      patterns: [
        { from: './src/3dModels', to: '3dModels' },
      ],
    } ),
  ],
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  module: {
    rules: [ {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [ 'file-loader', ],
      },
    ]
  }
}
module.exports = [ site ]