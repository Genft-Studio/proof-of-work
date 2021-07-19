/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
/* eslint-enable @typescript-eslint/no-var-requires */

const { DIR, EXT = 'ts' } = process.env;

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    entry: `./src/index.js`,
    output: {
        publicPath: '/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `./public/index.html`,
        }),
        new WorkerPlugin(),
    ],
    module: {
        rules: [{
            test: /\.[jt]sx?$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
            },
        }],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            'react-hooks-worker': `${__dirname}/src`,
        },
    },
    devServer: {
        port: process.env.PORT || '8080',
        contentBase: `./public`,
        historyApiFallback: true,
    },
};