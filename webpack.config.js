const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const I18nPlugin = require("i18n-webpack-plugin");
const HtmlStringReplace = require("html-string-replace-webpack-plugin-webpack-4");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const { exec, translations, rimraf } = require("./config");

exec("rimraf dist");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  return (env && env.language
    ? translations.filter(value => value.language === env.language)
    : translations
  ).map(translation => {
    return {
      entry: {
        index: [
          "./src/index.js",
          "selectric/public/selectric.css",
          "./src/styles/styles.scss",
          "./src/styles/index.scss"
        ],
        about: [
          "./src/about.js",
          "./src/styles/styles.scss",
          "./src/styles/about.scss"
        ],
        ia: [
          "./src/mkt/ia/index.js",
          "./src/styles/styles.scss",
          "./src/styles/mkt/ia/index.scss"
        ]
      },
      module: {
        rules: [
          {
            test: /\.s[ac]ss$/i,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                }
              },
              {
                loader: "postcss-loader",
                options: {
                  sourceMap: true
                }
              },
              {
                loader: "sass-loader",
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          {
            test: /\.(png|jpe?g|gif|svg)$/,
            use: [
              {
                loader: "url-loader",
                options: {
                  esModule: false,
                  limit: 0
                }
              },
              "image-webpack-loader"
            ]
          },
          {
            test: /\.(html)$/,
            use: {
              loader: "html-loader",
              options: {
                minimize: isProduction,
                removeAttributeQuotes: false,
                interpolate: true
              }
            }
          },
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"]
              }
            }
          },
          {
            test: /\.(css)$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          {
            test: /\.(woff|woff2|ttf|otf|eot)$/,
            use: ["file-loader"]
          }
        ]
      },
      devtool: isProduction ? "source-map" : "inline-cheap-module-source-map",
      plugins: [
        new I18nPlugin(translation.translation, {
          failOnMissing: true
        }),
        new HtmlWebpackPlugin({
          filename: path.join(translation.dist, "index.html"),
          template: "src/index.html",
          chunks: ["index", "vendor", "style"]
        }),
        new HtmlWebpackPlugin({
          filename: path.join(translation.dist, "about.html"),
          template: "src/about.html",
          chunks: ["about", "vendor", "style"]
        }),
        new HtmlWebpackPlugin({
          filename: path.join(translation.dist, "mkt/ia/index.html"),
          template: "src/mkt/ia/index.html",
          chunks: ["ia", "vendor", "style"]
        }),
        new HtmlStringReplace({
          patterns: [
            {
              match: /__(.+?)__/g,
              replacement: (match, $1) => translation.translation[$1]
            },
            {
              match: /(<img src=")(?!(\/\/|https?:\/\/|data:image))/gi,
              replacement: (match, $1) => `${$1}/`
            }
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
              match: /(<script type="text\/javascript" src=".*?)(?=vendor\.)/gi,
              replacement: (match, $1) => {
                return $1.substring(0, $1.lastIndexOf('"') + 1) + "/";
              }
            }
          ]
        }),
        new MiniCssExtractPlugin({
          filename: `[name]${isProduction ? ".[contenthash]" : ""}.css`
        }),
        new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery"
        }),
        new EventHooksPlugin({
          done: () => {
            if (!translation.default) {
              rimraf(`dist/${translation.language}`, [
                "+(*.css|*.css.map)",
                "+(*.png|*.jpg|*.jpeg|*.gif|*.svg)",
                "+(*.woff|*.woff2|*.ttf|*.otf|*.eot)",
                "+(vendor*.js|vendor*.js.map)"
              ]);
            }
          }
        })
      ],
      optimization: {
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendor",
              chunks: "all",
              filename: `[name]${isProduction ? ".[contenthash]" : ""}.js`
            },
            style: {
              test: /[\\/]src[\\/]styles[\\/]styles.scss/,
              name: "style",
              chunks: "all",
              filename: `[name]${isProduction ? ".[contenthash]" : ""}.js`,
              minSize: 0
            }
          }
        }
      },
      output: {
        path: translation.dist,
        filename: `[name].${translation.language}${
          isProduction ? ".[contenthash]" : ""
        }.js`
      }
    };
  });
};
