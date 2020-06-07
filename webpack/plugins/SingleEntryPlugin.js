class SingleEntryPlugin {
    constructor(context, entry, name) {
        this.context = context;
        this.entry = entry;
        this.name = name;
    }

    apply(compiler) {
        compiler.hooks.make.tapAsync(
            'SingleEntryPlugin',
            (compiler, callback) => {
                const {context, entry, name} = this;
            }
        )
    }
}

module.exports = SingleEntryPlugin;
