const {Tapable, SyncHook, SyncBailHook, AsyncParallelHook, AsyncSeriesHook} = require('tapable');
const mkdirp = require('mkdirp');
const path = require('path');
const NormalModuleFactory = require('./NormalModuleFactory');
const Compilation = require('./Compilation');
const Stats = require('./Stats');

class Compiler extends Tapable {
    constructor(context) {
        super();
        this.context = context;
        this.options = {};
        this.hooks = {
            // 初始化Node和钩子环境
            environment: new SyncHook([]),
            // 初始化Node和钩子环境后
            afterEnvironment: new SyncHook([]),
            // 入口文件增加钩子
            entryOptions: new SyncBailHook(['context', 'entry']),
            // run之前
            beforeRun: new AsyncSeriesHook(["compiler"]),
            // run
            run: new AsyncSeriesHook(["compiler"]),
            // 构建前
            beforeCompile: new AsyncSeriesHook(["params"]),
            // 构建
            compile: new SyncHook(["params"]),
            // 构建后
            afterCompile: new SyncHook(["params"]),
            // compilation 初始化前
            thisCompilation: new SyncHook(["compilation", "params"]),
            // compilation
            compilation: new SyncHook(["compilation", "params"]),
            // 构建对象初始化完成
            make: new AsyncParallelHook(['compilation']),
            // 构建完成
            emit: new AsyncSeriesHook(["compilation"]),
            // 构建结束
            done: new AsyncSeriesHook(["stats"])
        };

        // // 名称
        // this.name = undefined;
        // // 文件输入输出系统（为了方便扩展，如build是fs，server是memory-fs）
        // this.inputFileSystem = null;
        // this.outputFileSystem = null;
    }

    emitAssets(compilation, callback) {
        const emitFiles = err => {
            let assets = compilation.assets;
            for (let file in assets) {
                let source = assets[file];
                const targetPath = path.posix.join(this.options.output.path, file);
                let content = source;
                this.outputFileSystem.writeFileSync(targetPath, content);
            }
            callback();
        };

        this.hooks.emit.callAsync(compilation, err => {
            mkdirp(this.options.output.path).then(emitFiles);
        });
    }

    run(finalCallback) {
        // 终极回调，并执行 finalCallback，传入 Stats
        const onCompiled = (err, compilation) => {
            this.emitAssets(compilation, err => {
                const stats = new Stats(compilation);
                this.hooks.done.callAsync(stats, err => {
                    finalCallback(err, new Stats(compilation))
                });
            })
        };

        this.hooks.beforeRun.callAsync(this, () => {
            this.hooks.run.callAsync(this, err => {
                // 调用 compile 函数
                this.compile(onCompiled);
            });
        })
    }

    compile(onCompiled) {
        // 初始化 compilationParams（模块工厂）
        const params = this.newCompilationParams();
        this.hooks.beforeCompile.callAsync(params, () => {
            this.hooks.compile.call(params);
            // 初始化 compilation 对象
            const compilation = this.newCompilation(params);
            // 开始make
            this.hooks.make.callAsync(compilation, err => {
                compilation.seal(err => {
                    this.hooks.afterCompile.callAsync(compilation, err => {
                        return onCompiled(null, compilation);
                    });
                });
            });
        })
    }

    newCompilation(params) {
        const compilation = new Compilation(this);
        this.hooks.thisCompilation.call(compilation, params);
        this.hooks.compilation.call(compilation, params);
        return compilation;
    }

    newCompilationParams() {
        return {
            // 普通模块工厂类
            normalModuleFactory: new NormalModuleFactory()
        };
    }
}

module.exports = Compiler;
