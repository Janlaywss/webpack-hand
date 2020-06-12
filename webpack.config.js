const path = require('path');

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
        // new TestPlugin()
    ]
};
