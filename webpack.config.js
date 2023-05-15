const CONFIG = {
  mode: 'development',

  entry: {
    app: './app.js'
  },

  output: {
    library: 'App'
  },

  module: {
    rules: [
      {
        // Transpile ES6 to ES5 with babel
        // Remove if your app does not use JSX or you don't need to support old browsers
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules\/(?!chart\.js)/,
        options: {
          presets: ['@babel/preset-react'],
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      },
      
      {
        // Load GeoJSON files as JSON objects
        test: /\.geojson$/,
        loader: 'json-loader',
        exclude: [/node_modules/]
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        exclude: [/node_modules/]
      },
      
      // Add a new rule to handle chart.js file
      {
        test: /chart\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  }
};

// This line enables bundling against src in this repo rather than installed module
module.exports = env => (env ? require('../../webpack.config.local')(CONFIG)(env) : CONFIG);
