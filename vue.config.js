// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3010",
        ws: true
      },
      "/auth": {
        target: "http://localhost:3010",
        ws: true
      }
    }
  },
  runtimeCompiler: true
};