module.exports = function(config) {
  config.set({
    files: ['test.js'],

    frameworks: ['mocha', 'chai'],

    preprocessors: {
      'test.js': ['webpack'],
    },

    reporters: ['spec'],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /.js$/,
            loader: 'babel-loader',
          },
        ],
      },
      mode: 'development',
    },

    webpackMiddleware: {
      noInfo: true,
      stats: { errorDetails: true },
    },

    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-firefox-launcher'),
      require('karma-spec-reporter'),
    ],

    browsers: ['Firefox'],
  });
};
