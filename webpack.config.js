/**
 * Created by EgorDm on 29-May-2017.
 */
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const outputPath = path.join(__dirname, "dist");
module.exports = {
    devtool: 'source-map',
    entry: './src/js/app.js',
    output: {
        path: outputPath,
        filename: 'js/app.js'
    },
    module: {
        loaders: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader!sass-loader'
                }),
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("css/app.css"),
    ],
};