const path = require('path');
const Compiler = require('./Compiler');
const NodeEnvironmentPlugin = require('./plugins/NodeEnvironmentPlugin');
const WebpackOptionsApply = require('./WebpackOptionsApply');

const webpack = (options) => {
    // 设置目录默认为当前工作目录
    options.context = options.context || path.resolve(process.cwd());
    let compiler = new Compiler();
    compiler.options = options;
    // 初始化Node环境
    new NodeEnvironmentPlugin().apply(compiler);

    // 遍历插件并传入钩子
    if (options.plugins && Array.isArray(options.plugins)) {
        for (const plugin of options.plugins) {
            plugin.apply(compiler)
        }
    }

    // 执行 environment 钩子
    compiler.hooks.environment.call();
    // 执行 afterEnvironment 钩子
    compiler.hooks.afterEnvironment.call();

    // 初始化我们的内置插件环境
    new WebpackOptionsApply().process(options, compiler);

    return compiler;
};

module.exports = webpack;
