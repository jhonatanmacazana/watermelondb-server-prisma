const path = require("path");
const tsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const webpackNodeExternals = require("webpack-node-externals");

const config = {
  entry: "./src/index.ts",
  externalsPresets: { node: true },
  externals: [webpackNodeExternals()],
  devtool: "inline-source-map",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    plugins: [new tsConfigPathsPlugin()],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node",
};

module.exports = config;
