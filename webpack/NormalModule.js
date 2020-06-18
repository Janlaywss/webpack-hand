const path = require('path');
const types = require('babel-types');
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
const async = require('neo-async');
const ModuleDependency = require('./dependencies/ModuleDependency');

class NormalModule {
    constructor({name, context, rawRequest, resource, parser, moduleId}) {
        this.name = name;
        this.context = context;
        // 资源请求query
        this.rawRequest = rawRequest;
        this.resource = resource;
        // 模块解析器
        this.parser = parser;
        // 源码
        this._source = null;
        // AST抽象语法树
        this._ast = null;
        // 依赖数组
        this.dependencies = [];
        // 模块ID，一般为文件相对路径
        this.moduleId = moduleId;
        // 代码块
        this.blocks = [];
        this.async = async;
    }

    build(compilation, callback) {
        this.doBuild(compilation, err => {
            let originalSource = this.getSource(this.resource, compilation);
            const ast = this.parser.parse(originalSource);
            traverse(ast, {
                CallExpression: (nodePath) => {
                    let node = nodePath.node;

                    // 如果是require函数
                    if (node.callee.name === 'require') {
                        // 转化为 __webpack_require__
                        node.callee.name = '__webpack_require__';
                        // 拿到函数内的参数
                        let moduleName = node.arguments[0].value;
                        // 获取文件扩展名
                        let extension = moduleName.split(path.posix.sep).pop().indexOf(".") === -1 ? '.js' : '';
                        // 获取模块绝对路径
                        let dependencyResource = path.posix.join(path.posix.dirname(this.resource), moduleName + extension);
                        // 获取模块相对路径
                        let dependencyModuleId = '.' + path.posix.sep + path.posix.relative(this.context, dependencyResource);
                        // 添加一个依赖项
                        this.dependencies.push({
                            name: moduleName,
                            context: this.context,
                            parser: this.parser,
                            rawRequest: moduleName,
                            moduleId: dependencyModuleId,
                            resource: dependencyResource
                        });
                        // 重新更改函数内的参数
                        node.arguments = [types.stringLiteral(dependencyModuleId)];
                    } else if (types.isImport(nodePath.node.callee)) {
                        // 拿到函数内的参数
                        let moduleName = node.arguments[0].value;
                        // 获取文件扩展名
                        let extension = moduleName.split(path.posix.sep).pop().indexOf(".") === -1 ? '.js' : '';
                        // 获取模块绝对路径
                        let dependencyResource = path.posix.join(path.posix.dirname(this.resource), moduleName + extension);
                        // 获取模块相对路径
                        let dependencyModuleId = '.' + path.posix.sep + path.posix.relative(this.context, dependencyResource);
                        // 获取代码块的ID
                        let dependencyChunkId = dependencyModuleId.slice(2, dependencyModuleId.lastIndexOf('.')).replace(path.posix.sep, '_', 'g');
                        // chunkId 不需要带 .js 后缀
                        nodePath.replaceWithSourceString(`
                            __webpack_require__.e("${dependencyChunkId}").then(__webpack_require__.t.bind(null,"${dependencyModuleId}",7))
                        `);
                        this.blocks.push({
                            context: this.context,
                            entry: dependencyModuleId,
                            name: dependencyChunkId,
                            async: true
                        });
                    }
                }
            });
            // ast转换为代码
            let {code} = generate(ast);
            this._source = code;
            this._ast = ast;
            this.async.forEach(this.blocks, ({context, entry, name, async}, done) => {
                compilation._addModuleChain(context, new ModuleDependency(entry), name, async, done);
            }, callback);
        });
        callback()
    }

    // 获取模块代码
    doBuild(compilation, callback) {
        // 获取源码
        let originalSource = this.getSource(this.resource, compilation);
        this._source = originalSource;
        callback();
    }

    getSource(resource, compilation) {
        // 掉用fs模块获取源码
        let originalSource = compilation.inputFileSystem.readFileSync(resource, 'utf8');
        return originalSource;
    }
}

module.exports = NormalModule;
