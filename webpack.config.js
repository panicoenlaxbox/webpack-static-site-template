const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack')
const glob = require("glob");
const I18nPlugin = require('i18n-webpack-plugin');
const HtmlStringReplace = require('html-string-replace-webpack-plugin-webpack-4');
const EventHooksPlugin = require('event-hooks-webpack-plugin');
const exec = require('child_process').exec;

function execute(command) {
    exec(command, (err, stdout, stderr) => {
        process.stdout.write(stdout);
        process.stderr.write(stderr);
    });
}

execute('rimraf dist');

const translations =
    glob.sync("./src/languages/*.json").map(file => ({
        language: path.basename(file, path.extname(file)),
        translation: require(file),
    })).map(translation => {
        const isDefault = translation.language === 'en';
        return {
            ...translation,
            default: isDefault,
            dist: path.resolve(__dirname, 'dist', !isDefault ? translation.language : '')
        };
    });

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
                                removeAttributeQuotes: false,
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
            devtool: isProduction ? 'source-map' : 'inline-cheap-module-source-map',
            plugins: [
                new I18nPlugin(translation.translation, {
                    failOnMissing: true
                }),
                new HtmlWebpackPlugin({
                    filename: path.join(translation.dist, 'index.html'),
                    template: 'src/index.html',
                    hash: true,
                    chunks: ['index', 'vendor']
                }),
                new HtmlWebpackPlugin({
                    filename: path.join(translation.dist, 'about.html'),
                    template: 'src/about.html',
                    hash: true,
                    chunks: ['about', 'vendor']
                }),
                new HtmlStringReplace({
                    patterns: [
                        {
                            match: /__(.+?)__/g,
                            replacement: (match, $1) => translation.translation[$1]
                        },
                    ]
                }),
                new HtmlStringReplace({
                    enable: !translation.default,
                    patterns: [
                        {
                            match: /(<link href=")(?!(\/\/|https?:\/\/))/gi,
                            replacement: (match, $1) => `${$1}../`
                        },
                        {
                            match: /(<img src=")(?!(\/\/|https?:\/\/|data:image))/gi,
                            replacement: (match, $1) => `${$1}../`
                        }
                    ]
                }),
                new MiniCssExtractPlugin(),
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                }),
                new EventHooksPlugin({
                    done: () => {
                        if (!translation.default) {
                            execute(`rimraf \"dist/${translation.language}/**/!(*.html|*.js)\"`);
                        }
                    }
                })
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
                path: translation.dist,
                filename: `[name].${translation.language}.js`
            },
        };
    });
};