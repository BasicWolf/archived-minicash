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
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: [
                        ["transform-es2015-modules-commonjs", {
                            "allowTopLevelThis": false
                        }],
                    ]
                }
            },

            /* Handlebars */
            { test: /\.hbs$/, loader: "handlebars-loader"},

            /* CSS and SCSS */
            { test: /\.css$/, loaders: ["style-loader", "css-loader"] },
            {
                test: /\.scss$/,
                loader: extractSASS.extract({
                    use: ['css-loader', 'sass-loader'],
                })
            },

            /* Binary and related */
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader" },
            { test: /\.(woff|woff2)$/, loader: "url-loader?prefix=font/&limit=4096" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=8096&mimetype=application/octet-stream" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?limit=8096&mimetype=image/svg+xml" }
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
        modules: [
            path.join(__dirname, './src'),
            path.join(__dirname, './src/minicash'),
            'node_modules',
        ],
        extensions: ['.js'],
        alias: {
            node_modules: path.join(__dirname, './node_modules'),
            templates: path.join(__dirname, './src/templates'),
            img: path.join(__dirname, './src/img'),

            // import 'lib_name' aliases
            cocktail: 'backbone.cocktail/Cocktail.js',
            bloodhound: 'typeahead.js/dist/bloodhound.js',
            tagsinput: 'bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
            typeahead: 'typeahead.js/dist/typeahead.jquery'
        }
    },
};
