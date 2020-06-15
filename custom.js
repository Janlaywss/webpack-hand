const webpack = require('./webpack');
const config = require('./webpack.config.js');

const compiler = webpack(config);
compiler.run((err, stats) => {
   // console.log(stats);
    console.log('run success')
});
