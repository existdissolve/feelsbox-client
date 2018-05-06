const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/index.html",
    filename: "./index.html"
});

const copyPlugin = new CopyWebpackPlugin([{
    from: './favicon.ico',
    to: './favicon.ico',
    toType: 'file'
}, {
    from: './feelsbox.png',
    to: './feelsbox.png',
    toType: 'file'
}, {
    from: './manifest.json',
    to: './manifest.json',
    toType: 'file'
}]);

module.exports = {
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }]
    },
    plugins: [htmlPlugin, copyPlugin],
    resolve: {
        alias: {
            '-': path.join(__dirname, 'src')
        },
        extensions: ['.js', '.jsx']
    }
};
