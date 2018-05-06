const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

const htmlPlugin = new HtmlWebPackPlugin({
    template: "./src/index.html",
    filename: "./index.html"
});

/*const copyPlugin = new CopyWebpackPlugin([{
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
}]);*/
const manifestPlugin = new WebpackPwaManifest({
    name: 'FeelsBox',
    short_name: 'FeelsBox',
    description: 'A box of feels, just for you!',
    background_color: '#ffffff',
    icons: [{
        src: path.resolve('./feelsbox.png'),
        sizes: [128, 96, 64, 32, 24, 16] // multiple sizes
    }]
});

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
    plugins: [htmlPlugin, manifestPlugin],
    resolve: {
        alias: {
            '-': path.join(__dirname, 'src')
        },
        extensions: ['.js', '.jsx']
    }
};
