// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3010",
      },
      "/auth": {
        target: "http://localhost:3010",
        changeOrigin: false
      }
    }
  },
  runtimeCompiler: true
};
