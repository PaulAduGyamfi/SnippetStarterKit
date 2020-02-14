const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common");
module.exports = merge(common, {
  mode: "development",
  output: {
    path: path.resolve(__dirname, "dist/js/")
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader"],
        exclude: /node_modules/
      },
      {
        test: /\.css|\.s(c|a)ss$/,
        use: [
          {
            loader: "lit-scss-loader"
          },
          "extract-loader",
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  watch: true
});
