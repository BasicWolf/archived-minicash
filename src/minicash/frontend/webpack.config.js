'use strict';

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSASS = new ExtractTextPlugin('minicash.css');
const extractLoginCSS = new ExtractTextPlugin('login.css');

const srcDir = __dirname + '/src';
const _localNodeModulesDir = path.join(srcDir, '/node_modules');
const _relativeNodeModulesDir = path.join(
    require.resolve('webpack').split('node_modules')[0],
    'node_modules'
);

let nodeModulesDir = '';
if (fs.existsSync(_localNodeModulesDir)) {
    nodeModulesDir = _localNodeModulesDir;
} else if (fs.existsSync(_relativeNodeModulesDir)) {
    nodeModulesDir = _relativeNodeModulesDir;
} else {
    throw 'Cannot find node_modules directory';
}


module.exports = {
    entry: {
        minicash: path.join(srcDir, 'minicash.js'),
        login: path.join(srcDir, 'login.js'),
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
            {
                test: /login.scss.standalone$/,
                use: extractLoginCSS.extract({
                    use: ['css-loader', 'sass-loader'],
                })
            },
            { test: /\.css$/, loaders: ["style-loader", "css-loader"] },
            {
                test: /\.scss$/,
                loader: extractSASS.extract({
                    use: ['css-loader', 'sass-loader'],
                })
            },

            /* Binary and related */
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file-loader?name=[name].[ext]" },
            { test: /\.(woff|woff2)$/, loader: "url-loader?name=[name].[ext]&prefix=font/&limit=4096" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?name=[name].[ext]&limit=8096&mimetype=application/octet-stream" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?name=[name].[ext]&limit=8096&mimetype=image/svg+xml" }
        ]
    },

    output: {
        filename: '[name].js',
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
            srcDir,
            path.join(srcDir, 'minicash'),
            'node_modules',
        ],
        extensions: ['.js'],
        alias: {
            node_modules: nodeModulesDir,
            templates: path.join(srcDir, 'templates'),
            img:path.join(srcDir, 'img'),

            // import 'lib_name' aliases
            cocktail: 'backbone.cocktail/Cocktail.js',
            bloodhound: 'typeahead.js/dist/bloodhound.js',
            tagsinput: 'bootstrap-tagsinput/dist/bootstrap-tagsinput.js',
            typeahead: 'typeahead.js/dist/typeahead.jquery'
        }
    },
};
