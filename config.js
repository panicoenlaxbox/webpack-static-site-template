const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports.entry = {
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
    "./src/mkt/ia/ia.js",
    "./src/styles/styles.scss",
    "./src/styles/mkt/ia/index.scss"
  ]
};

module.exports.plugins = dist => [
  new HtmlWebpackPlugin({
    filename: path.join(dist, "index.html"),
    template: "src/index.html",
    chunks: ["index", "vendor", "style"]
  }),
  new HtmlWebpackPlugin({
    filename: path.join(dist, "about.html"),
    template: "src/about.html",
    chunks: ["about", "vendor", "style"]
  }),
  new HtmlWebpackPlugin({
    filename: path.join(dist, "mkt/ia/index.html"),
    template: "src/mkt/ia/index.html",
    chunks: ["ia", "vendor", "style"]
  })
];
