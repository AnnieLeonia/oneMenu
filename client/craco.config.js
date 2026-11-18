module.exports = {
  jest: {
    configure: (jestConfig) => {
      jestConfig.setupFiles = [
        "<rootDir>/src/jest.polyfills.js",
        ...(jestConfig.setupFiles || []),
      ];
      return jestConfig;
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Prefer CJS over ESM for packages that export Flow types from ./es (webpack 5).
      webpackConfig.resolve.mainFields = ["browser", "main", "module"];
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve("buffer/"),
      };
      return webpackConfig;
    },
  },
};
