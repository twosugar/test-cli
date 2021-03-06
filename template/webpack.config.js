const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");


module.exports = {
  mode: "development",
  optimization: {
    minimize: false, //打包后的代码展开
  },
  entry: {
    "babel-polyfill": "babel-polyfill",
    main: "./vue/demo.js",
  },
  output: {
    filename: "bundle.[name].js", //打包后的文件名
    path: path.resolve("./dist"), //打包后文件的路径
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      { test: /\.vue$/, loader: "vue-loader" },
      {
        test: /\.(jpg|png|jpeg|gif)$/,
        loader: "url-loader",
        options: { esModule: false },
      },
    ],
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      chunks: ["main"],
      template: "./index.html",
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: "./dist",
    contentBase: "/index.html",
    hot: true,
    port: 7979,
  },
};