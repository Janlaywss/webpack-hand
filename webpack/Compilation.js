const {Tapable, SyncHook} = require('tapable');
const path = require('path');
const async = require('neo-async');
const NormalModuleFactory = require('./NormalModuleFactory');
const Parser = require('./Parser');

const parser = new Parser();

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
        this._modules = {};
        this.hooks = {
            succeedModule: new SyncHook(["module"])
        }
    }

    addEntry(context, entry, name, callback) {
        // 递归链型构建
        this._addModuleChain(context, entry, name, (err, module) => {
            callback(err, module);
        });
    }

    _addModuleChain(context, entry, name, callback) {
        // 创建模块工厂
        const moduleFactory = new NormalModuleFactory();
        // 创建模块
        const module = moduleFactory.create({
            name,
            context: this.context,
            rawRequest: entry,
            resource: path.posix.join(context, entry),
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
                    callback(null, module);
                });
            } else {
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
            let module = moduleFactory.create({
                name, context, rawRequest, resource, moduleId, parser
            });

            if (!this._modules[module.moduleId]) {
                this.modules.push(module);
                this._modules[module.moduleId] = module;
            }

            const afterBuild = () => {
                if (module.dependencies) {
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
        // 调用 module 自己的编译方法
        module.build(this, (err) => {
            this.hooks.succeedModule.call(module);
            return afterBuild();
        });
    }
}

module.exports = Compilation;
