const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const Modes = {
  DEVELOPMENT: "development",
  PRODUCTION: "production"
}

const sourceDir = path.join(__dirname, "./src")
const sourceAudio = path.join(__dirname, "./src/assets/audio")

module.exports = (env, { mode }) => {
  const isProduction = mode === Modes.PRODUCTION

  return {
    mode,
    entry: path.join(__dirname, "src", "index.tsx"),
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"]
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "build"),
      publicPath: "/"
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "index.html"),
        favicon: path.join(__dirname, "src", "assets/images/favicon.ico")
      }),

      new MiniCssExtractPlugin({
        filename: isProduction ? "[name]-[contenthash].css" : "[name].css"
      })
    ],

    module: {
      rules: [
        {
          test: /\.(ts|tsx|js)$/,
          exclude: /node_modules/,
          include: sourceDir,
          loader: "babel-loader"
        },
        {
          test: /\.(ico|jpg|jpeg|png|svg|pdf)$/,
          include: sourceDir,
          type: "asset/resource"
        },
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"]
        },
        {
          test: /\.mp3$/,
          include: sourceAudio,
          loader: "file-loader"
        },
        {
          test: /\.wav$/,
          include: sourceAudio,
          loader: "file-loader"
        },
        {
          test: /\.s?css$/,
          oneOf: [
            {
              test: /\.m\.s?css$/,
              use: [
                MiniCssExtractPlugin.loader,
                {
                  loader: "css-loader",
                  options: {
                    modules: {
                      localIdentName: `${isProduction ? "" : "[local]--"}[hash:base64:5]`
                    }
                  }
                },
                "sass-loader"
              ]
            },
            {
              use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
          ]
        }
      ]
    },

    resolve: {
      extensions: [".ts", ".js", ".tsx", ".json", ".scss", ".css", ".m.scss", ".m.css"],
      modules: [path.resolve(__dirname, "./src"), "./node_modules"],

      alias: {
        "@root": path.resolve(__dirname, "./src"),
        "@api": path.resolve(__dirname, "./src/api"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@helpers": path.resolve(__dirname, "./src/helpers"),
        "@interfaces": path.resolve(__dirname, "./src/interfaces"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@styles": path.resolve(__dirname, "./src/styles")
      }
    },

    performance: {
      maxEntrypointSize: Infinity,
      maxAssetSize: 1024 ** 2
    },

    devtool: isProduction ? "source-map" : "inline-source-map",

    devServer: {
      host: "0.0.0.0",
      port: 3000,
      historyApiFallback: true
    }
  }
}
