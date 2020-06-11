const SingleEntryPlugin = require('./SingleEntryPlugin');

class EntryOptionPlugin {
    apply(compiler) {
        // 监听钩子触发，接受工作目录和入口
        compiler.hooks.entryOptions.tap('EntryOptionPlugin', (context, entry) => {
            // 实例化单入口插件钩子
            new SingleEntryPlugin(context, entry, 'main').apply(compiler);
        })
    }
}

module.exports = EntryOptionPlugin;
