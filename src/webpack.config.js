'use strict';

/* global module,require,__dirname */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const process = require('process');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSASS = new ExtractTextPlugin('minicash.css');
const extractLoginCSS = new ExtractTextPlugin('login.css');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const srcDir = path.resolve(__dirname, 'minicash/frontend/src');
const staticDir = path.resolve(srcDir, '../static');


const nodeModulesDir = path.join(
    require.resolve('webpack').split('node_modules')[0],
    'node_modules'
);

if (!fs.existsSync(nodeModulesDir)) {
    throw 'Cannot find node_modules directory';
}


let config = {
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
                        // use with es2015 preset
                        ["transform-es2015-modules-commonjs", {
                            "allowTopLevelThis": false
                        }],
                    ]
                }
            },

            /* Handlebars */
            {
                test: /\.hbs$/,
                loader: "handlebars-template-loader",

                query: {
                    root: srcDir,
                    parseDynamicRoutes: true
                }
            },

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
        path: staticDir,
        publicPath: '/static/'
    },

    plugins: [
        extractSASS,
        extractLoginCSS,
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            _: 'lodash'
        })
    ],

    externals: {
        "jquery": "jQuery",
        "lodash": "_",
        "underscore": "_",
        "backbone": "Backbone",
        "backbone.radio": "Backbone.Radio",
        "backbone.marionette": "Mn",
        "moment": "moment",
        "select2": "select2",
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
            img: path.join(srcDir, 'img'),


            // import 'lib_name' aliases
            cocktail: 'backbone.cocktail/Cocktail.jsd',
            typeahead: 'typeahead.js/dist/typeahead.jquery'
        }
    },
};

if (process.env.NODE_ENV == 'production') {
    config.plugins.push(new UglifyJSPlugin({
        compress: true,
        mangle: {
            except: ['$', '_', 'Backbone', 'exports', 'jQuery',
                     'minicash', 'moment', 'Mn', 'require', 'select2', 'tr']
        },
        drop_debugger: true,
        drop_console: true,
    }));

    config.plugins.push(new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: {removeAll: true } },
        canPrint: true
    }));

} else {
    config.module.rules.push({
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
    });
}

module.exports = config;
