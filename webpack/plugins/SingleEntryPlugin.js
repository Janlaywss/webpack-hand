let SingleEntryDependency = require('../dependencies/SingleEntryDependency');

class SingleEntryPlugin {
    constructor(context, entry, name) {
        this.context = context;
        this.entry = entry;
        this.name = name;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(
            "SingleEntryPlugin",
            (compilation, { normalModuleFactory }) => {
                // 向模块依赖工厂map set一个单入口依赖工厂
                compilation.dependencyFactories.set(
                    SingleEntryDependency,
                    normalModuleFactory
                );
            }
        );

        // 监听钩子执行，如果执行的话开始编译
        compiler.hooks.make.tapAsync(
            'SingleEntryPlugin',
            (compilation, callback) => {
                const {context, entry, name} = this;
                // 创建一个Dep对象
                const dep = SingleEntryPlugin.createDependency(entry, name);
                compilation.addEntry(context, dep, name, callback);
            }
        )
    }

    static createDependency(entry, name) {
        return new SingleEntryDependency(entry);
    }
}

module.exports = SingleEntryPlugin;
