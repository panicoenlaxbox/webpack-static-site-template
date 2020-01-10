const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const I18nPlugin = require("i18n-webpack-plugin");
const HtmlStringReplace = require("html-string-replace-webpack-plugin-webpack-4");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const { exec, translations, rimraf } = require("./utilities");
const { entry, plugins } = require("./config");

exec("rimraf dist");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const activeTranslations =
    env && env.language
      ? translations.filter(value => value.language === env.language)
      : translations;
  return activeTranslations.map(translation => {
    return {
      entry: entry,
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
        ...plugins(translation.dist),
        new HtmlStringReplace({
          patterns: [
            {
              match: /__(.+?)__/g,
              replacement: (match, $1) => translation.translation[$1]
            },
            {
              match: /(<img src=")(?!(\/\/|https?:\/\/|data:image))/gi,
              replacement: (match, $1) => {
                const substitution = `${$1}/`;
                console.log(
                  `[${translation.language}] changing from ${$1} to ${substitution}`
                );
                return substitution;
              }
            }
          ]
        }),
        new HtmlStringReplace({
          enable: !translation.default,
          patterns: [
            {
              match: /(<link href=")(?!(\/\/|https?:\/\/))/gi,
              replacement: (match, $1) => {
                const substitution = `${$1}../`;
                console.log(
                  `[${translation.language}] changing from ${$1} to ${substitution}`
                );
                return substitution;
              }
            },
            {
              match: /(<script type="text\/javascript" src=".*?)(?=vendor\.)/gi,
              replacement: (match, $1) => {
                const substitution =
                  $1.substring(0, $1.lastIndexOf('"') + 1) + "/";
                console.log(
                  `[${translation.language}] changing from ${$1} to ${substitution}`
                );
                return substitution;
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
