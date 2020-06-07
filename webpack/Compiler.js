const {Tapable, SyncHook, SyncBailHook, AsyncParallelHook} = require('tapable');

class Compiler extends Tapable {
    constructor(context) {
        super();
        this.context = context;
        this.options = {};
        this.hooks = {
            environment: new SyncHook([]),
            afterEnvironment: new SyncHook([]),
            entryOptions: new SyncBailHook(['context', 'entry']),
            make: new AsyncParallelHook(['compilation'])
        };

        // // 名称
        // this.name = undefined;
        // // 文件输入输出系统（为了方便扩展，如build是fs，server是memory-fs）
        // this.inputFileSystem = null;
        // this.outputFileSystem = null;
    }

    run() {
        console.log('compile run')
    }
}

module.exports = Compiler;
