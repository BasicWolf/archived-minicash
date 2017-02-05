'use strict';

const webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const extractSASS = new ExtractTextPlugin('minicash.css');
const extractLoginCSS = new ExtractTextPlugin('login.css');

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

            /* Handlebars */
            { test: /\.hbs$/, loader: "handlebars-loader"},

            /* CSS and SCSS */
            {test: /login.scss_$/, loader: extractLoginCSS.extract("style", ["css", "sass"])},

            {test: /\.css$/, loaders: ["style", "css"] },
            {test: /\.scss$/, loader: extractSASS.extract(["css", "sass"])},

            /* Binary and related */
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
            { test: /\.(woff|woff2)$/, loader: "url?prefix=font/&limit=4096" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=8096&mimetype=application/octet-stream" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=8096&mimetype=image/svg+xml" }
        ]
    },

    output: {
        filename: 'minicash.js',
        path: path.join(__dirname, './static/'),
        publicPath: '/static/'
    },

    plugins: [
        extractSASS,
        extractLoginCSS,
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
            'templates': path.join(__dirname, './src/templates'),
            'img': path.join(__dirname, './src/img'),

            // import 'lib_name' aliases
            'cocktail': 'backbone.cocktail/Cocktail.js',
            'bloodhound': 'typeahead.js/dist/bloodhound.js',
            'tagsinput': 'bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
            'typeahead': 'typeahead.js/dist/typeahead.jquery'
        }
    },
    resolveLoader: {
        root: path.join(__dirname, './node_modules')
    }
};
