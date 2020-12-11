const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');
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
const serviceWorker = new ServiceWorkerWebpackPlugin({
    entry: path.join(process.cwd(), 'src/sw-fb.js')
});

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
        index: 'App',
        port: 8081,
        proxy: {
            '/api/**': {
                target: 'http://localhost:5000',
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
    plugins: [htmlPlugin, serviceWorker, manifestPlugin, hotModule, new Dotenv()],
    resolve: {
        alias: {
            '-': path.join(__dirname, 'src'),
            'react-dom': '@hot-loader/react-dom'
        },
        extensions: ['.js', '.jsx']
    }
};
