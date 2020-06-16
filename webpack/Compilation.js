const {Tapable, SyncHook} = require('tapable');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const async = require('neo-async');
const NormalModuleFactory = require('./NormalModuleFactory');
const Parser = require('./Parser');
const Chunk = require('./Chunk');

const parser = new Parser();
const mainTemplate = fs.readFileSync(path.join(__dirname, 'template', 'runtime-bundle.ejs'), 'utf8');
const mainRender = ejs.compile(mainTemplate);

class Compilation extends Tapable {
    constructor(compiler) {
        super();
        // 模块依赖工厂map
        this.dependencyFactories = new Map();
        // compiler 对象
        this.compiler = compiler;
        this.options = compiler.options;
        this.context = compiler.context;
        this.inputFileSystem = compiler.inputFileSystem;
        this.outputFileSystem = compiler.outputFileSystem;
        this.entries = [];
        this.chunks = [];
        this.files = [];  //生成的文件
        this.assets = {}; //资源
        this.modules = [];
        this._modules = {};
        this.hooks = {
            buildModule: new SyncHook(["module"]),
            succeedModule: new SyncHook(["module"]),
            seal: new SyncHook([]),
            beforeChunks: new SyncHook([]),
            afterChunks: new SyncHook(["chunks"])
        }
    }

    seal(callback) {
        this.hooks.seal.call();
        //生成代码块之前
        this.hooks.beforeChunks.call();
        for (const module of this.entries) { // 循环入口模块
            const chunk = new Chunk(module); // 创建代码块
            this.chunks.push(chunk); // 把代码块添加到代码块数组中
            // 把代码块的模块添加到代码块中
            chunk.modules = this.modules.filter(module => module.name === chunk.name);
        }
        this.hooks.afterChunks.call(this.chunks);// 生成代码块之后
        this.createChunkAssets();
        callback();// 封装结束
    }

    createChunkAssets() {
        for (let i = 0; i < this.chunks.length; i++) {
            const chunk = this.chunks[i];
            chunk.files = [];
            const file = chunk.name + '.js';
            const source = mainRender({entryId: chunk.entryModule.moduleId, modules: chunk.modules});
            chunk.files.push(file);
            this.emitAsset(file, source);
        }
    }

    emitAsset(file, source) {
        this.assets[file] = source;
        this.files.push(file);
    }

    addEntry(context, entry, name, callback) {
        // 递归链型构建
        this._addModuleChain(context, entry, name, (err, module) => {
            callback(err, module);
        });
    }

    _addModuleChain(context, dependency, name, callback) {
        // 拿到 dependency 的构造函数
        const Dep = dependency.constructor;
        // 获取到Dep对应的模块工厂（模块和模块之间工厂方法不同）
        const moduleFactory = this.dependencyFactories.get(Dep);
        // 创建模块
        const module = moduleFactory.create({
            name,
            context: this.context,
            rawRequest: dependency.request,
            resource: path.posix.join(context, dependency.request),
            parser
        });
        // 构建模块ID（和文件相对路径一致）
        module.moduleId = '.' + path.posix.sep + path.posix.relative(this.context, module.resource);
        this.modules.push(module);
        this.entries.push(module);
        // 编译一次后的回调
        const afterBuild = () => {
            // 如果依赖项 > 0，递归调用
            if (module.dependencies.length > 0) {
                this.processModuleDependencies(module, err => {
                    this.hooks.succeedModule.call(module);
                    callback(null, module);
                });
            } else {
                this.hooks.succeedModule.call(module);
                return callback(null, module);
            }
        };
        this.buildModule(module, afterBuild);
    }

    processModuleDependencies(module, callback) {
        let dependencies = module.dependencies;
        async.forEach(dependencies, (dependency, done) => {
            let {name, context, rawRequest, resource, moduleId, parser} = dependency;
            const moduleFactory = new NormalModuleFactory();
            // 使用模块工厂构建模块对象
            let module = moduleFactory.create({
                name, context, rawRequest, resource, moduleId, parser
            });

            // 避免重复添加模块
            if (!this._modules[module.moduleId]) {
                this.modules.push(module);
                this._modules[module.moduleId] = module;
            }

            const afterBuild = () => {
                if (module.dependencies) {
                    // 递归创建模块对象
                    this.processModuleDependencies(module, err => {
                        done(null, module);
                    });
                } else {
                    return done(null, module);
                }
            };

            this.buildModule(module, afterBuild);
        }, callback);
    }

    buildModule(module, afterBuild) {
        this.hooks.buildModule.call(module);
        // 调用 module 自己的编译方法
        module.build(this, (err) => {
            this.hooks.succeedModule.call(module);
            return afterBuild();
        });
    }
}

module.exports = Compilation;
