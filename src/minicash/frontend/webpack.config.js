'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const nodeDir = __dirname + '/node_modules';


module.exports = {
    entry: {
        app: ['./src/minicash']
    },

    module: {
        loaders: [
            {
                test: /\.coffee$/,
                exclude: /node_modules/,
                loader: "babel?presets[]=es2015!coffee"
            },

            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },

            { test: /\.hbs$/, loader: "handlebars-loader"},

            /* CSS and Bootstrap */
            { test: /\.css$/, loaders: ["style", "css"] },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
            { test: /\.(woff|woff2)$/, loader: "url?prefix=font/&limit=5000" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },

            {test: /\.scss$/, loaders: ["style", "css", "sass"]}
        ]
    },

    output: {
        filename: 'minicash.js',
        path: path.join(__dirname, './static/'),
        publicPath: '/static/'
    },

    plugins: [
        new ExtractTextPlugin('minicash.css'),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            _: 'underscore'
        })
    ],

    externals: {
        "jquery": "jQuery",
        "underscore": "_",
        "backbone": "Backbone",
        "backbone.radio": "Backbone.Radio",
        "backbone.marionette": "Mn",
        "moment": "moment"
    },

    resolve: {
        root: path.join(__dirname, './src'),
        extensions: ["", ".coffee", ".js"],
        alias: {
            templates: path.join(__dirname, './src/templates')
        }
    },
    resolveLoader: {
        root: path.join(__dirname, './node_modules')
    }
};
