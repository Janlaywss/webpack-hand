const EntryOptionPlugin = require('./plugins/EntryOptionPlugin');

class WebpackOptionsApply {
    process(options, compiler) {
        // 初始化入口选项插件
        new EntryOptionPlugin().apply(compiler);
        // 调用钩子触发
        compiler.hooks.entryOptions.call(options.context, options.entry);
    }
}

module.exports = WebpackOptionsApply;
