const path = require('path');
const TestPlugin = require('./plugins/TestPlugin');

module.exports = {
    context: process.cwd(),
    mode: 'development',
    devtool: "none",
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js"
    },
    plugins: [
        new TestPlugin()
    ]
};
