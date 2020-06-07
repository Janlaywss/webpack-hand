const {Tapable, SyncHook} = require('tapable');

class Compiler extends Tapable {
    constructor(context) {
        super();
        this.context = context;
        this.options = {};
        this.hooks = {
            environment: new SyncHook([]),
            afterEnvironment: new SyncHook([]),
        };

        // // 名称
        // this.name = undefined;
        // // 文件输入输出系统（为了方便扩展，如build是fs，server是memory-fs）
        // this.inputFileSystem = null;
        // this.outputFileSystem = null;
    }

    run() {
    }
}

module.exports = Compiler;
