class SingleEntryPlugin {
    constructor(context, entry, name) {
        this.context = context;
        this.entry = entry;
        this.name = name;
    }

    apply(compiler) {
        // 监听钩子执行，如果执行的话开始编译
        compiler.hooks.make.tapAsync(
            'SingleEntryPlugin',
            (compiler, callback) => {
                const {context, entry, name} = this;
            }
        )
    }
}

module.exports = SingleEntryPlugin;
