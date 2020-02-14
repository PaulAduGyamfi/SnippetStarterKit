module.exports = {
  entry: {
    main: "./src/js/app.ts"
  },
  output: {
    filename: "[name].js"
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".css", ".scss"]
  }
};
