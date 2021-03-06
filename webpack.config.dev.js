'use strict'

var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

var proxyMiddleware = require('http-proxy-middleware')

const target = {
  target: 'http://localhost:1337'
}
const data = proxyMiddleware('/data', target)

module.exports = {
  devtool: 'source-map',
  entry: {
    // 'hot-dev-server': 'webpack/hot/dev-server',
    // 'dev-server': 'webpack-dev-server/client?http://localhost:8080',
    // 'dev-server': 'webpack-dev-server/client?http://localhost:8080/',
    // 'hot-dev-server': 'webpack/hot/dev-server',
    // s: './src/js/s.js',
    index: './src/js/index.js'
    // common: [
    //   'lodash'
    //   // 'jquery'
    // ]
  },
  proxy: {
    '/data/*': 'http://localhost:1337/'
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: './js/[name].js' // Template based on keys in entry above
  },
  resolve: {
    extensions: ['', '.js', '.json'],
    modulesDirectories: [
      './node_modules',
    ]
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    // new BrowserSyncPlugin(
    //   // BrowserSync options
    //   {
    //     // browse to http://localhost:3000/ during development
    //     host: 'localhost',
    //     port: 3000,
    //     // proxy the Webpack Dev Server endpoint
    //     // (which should be serving on http://localhost:3100/)
    //     // through BrowserSync
    //     proxy: 'http://localhost:8080/',
    //     middleware: [data]
    //   },
    //   // plugin optionss
    //   {
    //     // prevent BrowserSync from reloading the page
    //     // and let Webpack Dev Server take care of this
    //     reload: false
    //   }
    // ),
    new ExtractTextPlugin('./css/main.css', { allChunks: true })
  ],
  module: {
    loaders: [{
      test: /\.css$/,
      loaders: ['style', 'css'],
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]&sourceMap!postcss-loader!sass'),
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.js$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/,
      include: path.join(__dirname, 'src')
    },
    {
      test: /\.(png|jpg|ttf)$/, loader: 'url-loader?limit=8192'
    }]
  },
  devServer: {
    // port: 8081,
    // contentBase: 'src/',
    // historyApiFallback: true,
    proxy: {
      '/data': {
        target: 'http://localhost:1337'
        // pathRewrite: {
        //   '^/api' : ''
        // }
      }
    }
  },
  // devServer: {
  //   contentBase: './dist',
  //   hot: true,
  //   quiet: false,
  //   noInfo: false,
  // },
  // externals: {
  //   jquery: {
  //     root: 'jQuery',
  //     commonjs: 'jquery',
  //     commonjs2: 'jquery',
  //     amd: 'jquery'
  //   }
  // }
}
