const path = require('path');
const Compiler = require('./Compiler');
const NodeEnvironmentPlugin = require('./plugins/NodeEnvironmentPlugin');
const WebpackOptionsApply = require('./WebpackOptionsApply');

const webpack = (options) => {
    options.context = options.context || path.resolve(process.cwd());
    let compiler = new Compiler();
    compiler.options = options;
    new NodeEnvironmentPlugin().apply(compiler);

    if (options.plugins && Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
            plugin.apply(compiler)
        }
    }

    compiler.hooks.environment.call();
    compiler.hooks.afterEnvironment.call();

    new WebpackOptionsApply().process(options, compiler);

    return compiler;
};

module.exports = webpack;
