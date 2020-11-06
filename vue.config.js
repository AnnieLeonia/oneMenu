// vue.config.js
module.exports = {
  devServer: process.env.NODE_ENV === 'production' ? {} : {
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