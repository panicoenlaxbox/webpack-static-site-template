const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports.entry = {
  index: ["./src/index.js"],
  about: "./src/about/about.js"
};

module.exports.plugins = dist => [
  new HtmlWebpackPlugin({
    filename: path.join(dist, "index.html"),
    template: "src/index.html",
    chunks: ["index", "vendor", "style"]
  }),
  new HtmlWebpackPlugin({
    filename: path.join(dist, "about/about.html"),
    template: "src/about/about.html",
    chunks: ["about", "vendor", "style"]
  })
];
