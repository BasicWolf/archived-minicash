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

const srcDir = path.resolve(__dirname, 'minicash/frontend/src2');
const staticDir = path.resolve(srcDir, '../static');
const imgDir = path.join(srcDir, 'img');


const nodeModulesDir = path.join(
    require.resolve('webpack').split('node_modules')[0],
    'node_modules'
);

if (!fs.existsSync(nodeModulesDir)) {
    throw 'Cannot find node_modules directory';
}


let config = {
    entry: {
        minicash: path.join(srcDir, 'app.js'),
        login: path.join(srcDir, 'login.js'),
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        query: {
                            presets: ['env'],
                        }
                    },
                    // disable till 2.10 is released
                    // {
                    //     loader: 'jshint-loader',
                    // }
                ]
            },

            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                    },
                ]
            },


            /* CSS and SCSS */
            /*==============*/
            {
                test: /login.scss.standalone$/,
                use: extractLoginCSS.extract({
                    use: ['css-loader', 'sass-loader'],
                })
            },

            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run post css actions
                    options: {
                        plugins: function () { // post css plugins, can be exported to postcss.config.js
                            return [
                                require('precss'),
                                require('autoprefixer')
                            ];
                        }
                    }
                }, {
                    loader: 'sass-loader' // compiles SASS to CSS
                }]
            },

            { test: /\.css$/, loaders: ["style-loader", "css-loader", 'sass-loader'] },

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

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        }),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
            // // In case you imported plugins individually, you must also require them here:
            // Util: "exports-loader?Util!bootstrap/js/dist/util",
            // Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
            // ...
        })
    ],

    resolve: {
        modules: [
            srcDir,
            path.join(srcDir, 'minicash'),
            'node_modules',
        ],
        extensions: ['.js', '.vue', '.json'],
        alias: {
            node_modules: nodeModulesDir,
            img: imgDir,
            '~': path.join(srcDir, 'minicash'),

            'vue': 'vue/dist/vue.esm.js',

            // import 'lib_name' aliases example:
            // libalias: 'path/to/lib/name.js',
        }
    },

    externals: {
        "jquery": "jQuery"
    },

    node: {
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
};


if (process.env.NODE_ENV == 'production') {
    config.plugins.push(new UglifyJSPlugin({
        compress: true,
        mangle: {
            except: ['exports', 'minicash', 'moment', 'require', 'tr']
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
    config.devtool = "source-map";
    config.module.rules.push({
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
    });
}

module.exports = config;
