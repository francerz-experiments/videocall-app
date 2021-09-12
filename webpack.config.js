const path = require('path');

module.exports = {
    mode: 'production',
    devtool: "source-map",
    entry: {
        main: "./client/ts/Client.ts"
    },
    output: {
        path: path.resolve(__dirname, './public/assets'),
        filename: 'script.js'
    },
    resolve: {
        extensions: ['.ts','.tsx','.js']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    }
}