// This library allows us to combine paths easily
const path = require('path');

module.exports = [{
        entry: path.resolve(__dirname, 'src/js', 'application.js'),
        output: {
            path: path.resolve(__dirname, 'dist/js'),
            filename: 'application.js'
        },
        resolve: {
            extensions: ['.js']
        },
        module: {
            rules: [
            {
                test: /\.js/,
                use: {
                    loader: 'babel-loader',
                    options: { 
                        "presets": [
                        [ "@babel/preset-env", {
                          "targets": {
                            "browsers": [ "last 1 version", "ie >= 11" ]
                          }
                        }]
                      ]
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['css-loader'],
            }]
        }
    }
];