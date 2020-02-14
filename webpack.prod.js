const path = require("path")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const UglifyJS = require("uglify-es")

const merge = require("webpack-merge")
const common = require("./webpack.common")

const DefaultUglifyJsOptions = UglifyJS.default_options()
const compress = DefaultUglifyJsOptions.compress
for (let compressOption in compress) {
  compress[compressOption] = false
}
compress.unused = true

module.exports = merge(common, {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "temp/js/")
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["ts-loader", "prettier-loader"],
        exclude: /node_modules/
      },
      {
        test: /\.css|\.s(c|a)ss$/,
        use: [
          {
            loader: "lit-scss-loader",
            options: {
              minify: true // defaults to false
            }
          },
          "extract-loader",
          "css-loader",
          "sass-loader",
          "postcss-loader"
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0
    },
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress,
          mangle: false,
          output: {
            beautify: true
          }
        }
      })
    ],
    usedExports: true,
    sideEffects: true
  }
})
