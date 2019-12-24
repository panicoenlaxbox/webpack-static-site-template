const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack')
const glob = require("glob");
const I18nPlugin = require('i18n-webpack-plugin');
const HtmlWebpackStringReplacePlugin = require('html-webpack-string-replace-plugin');

const translations =
    glob.sync("./src/languages/*.json").map(file => ({
        language: path.basename(file, path.extname(file)),
        translation: require(file),
    })).map(translation => ({
        ...translation,
        default: translation.language === 'en'
    }));

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return translations.map((translation) => {

        return {
            entry: {
                index: './src/index.js',
                about: './src/about.js',
                vendor: ['jquery', 'selectric']
            },
            module: {
                rules: [
                    {
                        test: /\.s[ac]ss$/i,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: true,
                                },
                            }
                        ],
                    },
                    {

                        test: /\.(png|jpe?g|gif|svg)$/,
                        use: [
                            {
                                loader: 'url-loader',
                                options: {
                                    esModule: false,
                                    limit: 0
                                }
                            },
                            'image-webpack-loader'
                        ]
                    },
                    {
                        test: /\.(html)$/,
                        use: {
                            loader: 'html-loader',
                            options: {
                                minimize: isProduction,
                                interpolate: true,
                            }
                        }
                    },
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    },
                    {
                        test: /\.(css)$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: true,
                                },
                            }
                        ]
                    },
                    {
                        test: /\.(woff|woff2|ttf|otf|eot)$/,
                        use: [
                            'file-loader'
                        ]
                    }
                ]
            },
            plugins: [
                new I18nPlugin(translation.translation, {
                    failOnMissing: true
                }),
                new HtmlWebpackPlugin({
                    filename: path.resolve(path.resolve(__dirname, 'dist', translation.language, 'index.html')),
                    template: 'src/index.html',
                    hash: true,
                    chunks: ['index', 'vendor']
                }),
                new HtmlWebpackPlugin({
                    filename: path.resolve(path.resolve(__dirname, 'dist', translation.language, 'about.html')),
                    template: 'src/about.html',
                    hash: true,
                    chunks: ['about', 'vendor']
                }),
                new HtmlWebpackStringReplacePlugin(
                    // https://stackoverflow.com/a/32452554
                    Object.assign(
                        {},
                        ...Object.keys(translation.translation).map(key => ({ [`__${key}__`]: translation.translation[key] })),
                        {
                            '__language__': translation.language
                        }
                    )),
                new CleanWebpackPlugin(),
                new MiniCssExtractPlugin(),
                new webpack.SourceMapDevToolPlugin(),
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                }),
            ],
            mode: 'development',
            optimization: {
                splitChunks: {
                    cacheGroups: {
                        commons: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "vendor",
                            chunks: "all"
                        }
                    }
                }
            },
            output: {
                path: path.resolve(path.resolve(__dirname, 'dist', translation.language)),
                filename: `[name].${translation.language}.js`
            },
        };
    });
};