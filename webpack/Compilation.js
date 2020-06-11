const {Tapable} = require('tapable');

class Compilation extends Tapable {
    constructor(compiler) {
        super();
        // compiler 对象
        this.compiler = compiler;
        this.options = compiler.options;
        this.context = compiler.context;
        this.inputFileSystem = compiler.inputFileSystem;
        this.outputFileSystem = compiler.outputFileSystem;
        this.entries = [];
        this.modules = [];
    }

    addEntry(context, entry, name, callback) {
        console.log('add Entry');
        callback()
    }
}

module.exports = Compilation;
