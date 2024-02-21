const path = require("path")
// const NodeExternals = require("webpack-node-externals")

const config = {
      node: {
            __filename: false,
            __dirname: false,
      },
      module: {
            rules: [
                  {
                        test: /\.ts?$/,
                        use: {
                              loader: 'ts-loader'
                        },
                        exclude: /node_modules\/(?!()\/).*/,
                  },
            ],
      },
      resolve: {
            extensions: [".ts", ".js", "..."],
            // extensions: [".ts", ".tsx", ".js", "..."],
            alias: {
                  src: path.resolve(__dirname, "src"),
                  // back: path.resolve(__dirname, "src/back"),
                  // front: path.resolve(__dirname, "src/front"),
                  database: path.resolve(__dirname, "src/database"),
                  controller: path.resolve(__dirname, "src/controller"),
                  model: path.resolve(__dirname, "src/model"),
                  util: path.resolve(__dirname, "src/util"),
                  common: path.resolve(__dirname, "src/common"),
                  // reactNative: path.resolve(__dirname, "node_modules/react-native-web")// [IMPORTANT] 모든 react-native import를 react-native-web으로 바꿈
            },
      },
      target: "node",
      // externals: [NodeExternals()]
}
// config.resolve.alias["react-native"] = path.resolve(__dirname, "node_modules/react-native-web")
const configMain = {
      name: "main",
      entry:
            // {
            // index: [
            //       "@babel/polyfill",
            path.resolve(__dirname, "src/main.ts")
      // ]
      // }
      ,
      output: {
            path: path.join(__dirname, "build"),
            filename: "main.js",
      },
      ...config,
}
const configProcess = {
      name: "web",
      entry: path.resolve(__dirname, "src/process.ts"),
      output: {
            path: path.join(__dirname, "build"),
            filename: "process.js",
      },
      ...config,
}
module.exports = [
      configMain, configProcess
]
