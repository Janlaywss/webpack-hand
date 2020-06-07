const EntryOptionPlugin = require('./plugins/EntryOptionPlugin');

class WebpackOptionsApply {
    process(options, compiler) {
        new EntryOptionPlugin().apply(compiler);
        compiler.hooks.entryOptions.call(options.context, options.entry);
    }
}

module.exports = WebpackOptionsApply;
