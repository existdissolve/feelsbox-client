const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const Dotenv = require('dotenv-webpack');

const htmlPlugin = new HtmlWebPackPlugin({
    template: './src/index.html',
    filename: './index.html'
});

const manifestPlugin = new WebpackPwaManifest({
    name: 'FeelsBox',
    short_name: 'FeelsBox',
    description: 'A box of feels, just for you!',
    background_color: '#ffffff',
    ios: true,
    icons: [{
        src: path.resolve('./feelsbox.png'),
        ios: true,
        sizes: [128, 96, 64, 32, 24, 16] // multiple sizes
    }]
});

const hotModule = new webpack.HotModuleReplacementPlugin();

module.exports = {
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        compress: true,
        contentBase: 'src',
        historyApiFallback: true,
        host: 'feelsbox.local',
        hot: true,
        https: {
            ca: fs.readFileSync(('./cert/ca.pem')),
            cert: fs.readFileSync('./cert/localhost.pem'),
            key: fs.readFileSync('./cert/localhost-key.pem')
        },
        index: 'App',
        port: 8081,
        proxy: {
            '/api/**': {
                target: 'https://localhost:5000',
                secure: false
            }
        }
    },
    output: {
        pathinfo: false,
        path: path.resolve(process.cwd(), 'build'),
        publicPath: '/',
        filename: '[name].js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [htmlPlugin, manifestPlugin, hotModule, new Dotenv()],
    resolve: {
        alias: {
            '-': path.join(__dirname, 'src'),
            'react-dom': '@hot-loader/react-dom'
        },
        extensions: ['.js', '.jsx']
    }
};
