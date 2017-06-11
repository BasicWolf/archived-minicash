'use strict';
/* global module,require,__dirname */

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

const extractSASS = new ExtractTextPlugin('minicash.css');
const extractLoginCSS = new ExtractTextPlugin('login.css');

const nodeDir = __dirname + '/node_modules';


const baseConfig = require('./webpack.config.js');


baseConfig.plugins.push(new UglifyJSPlugin({
    compress: true,
    mangle: {
        except: ['$', '_', 'Backbone', 'exports', 'jQuery', 'minicash', 'moment', 'Mn', 'tr', 'require']
    }
}));

baseConfig.plugins.push(new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: { discardComments: {removeAll: true } },
      canPrint: true
}));

module.exports = baseConfig;
