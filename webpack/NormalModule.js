const path = require('path');
const types = require('babel-types');
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;

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
    }

    build(compilation, callback) {
        this.doBuild(compilation, err => {
            let originalSource = this.getSource(this.resource, compilation);
            const ast = this.parser.parse(originalSource);
            traverse(ast, {
                CallExpression: (nodePath) => {
                    let node = nodePath.node;
                    if (node.callee.name === 'require') {
                        node.callee.name = '__webpack_require__';
                        let moduleName = node.arguments[0].value;
                        let extension = moduleName.split(path.posix.sep).pop().indexOf(".") === -1 ? '.js' : '';
                        let dependencyResource = path.posix.join(path.posix.dirname(this.resource), moduleName + extension);
                        let dependencyModuleId = '.' + path.posix.sep + path.posix.relative(this.context, dependencyResource);
                        this.dependencies.push({
                            name: moduleName,
                            context: this.context,
                            parser: this.parser,
                            rawRequest: moduleName,
                            moduleId: dependencyModuleId,
                            resource: dependencyResource
                        });
                        node.arguments = [types.stringLiteral(dependencyModuleId)];
                    }
                }
            });
            let {code} = generate(ast);
            this._source = code;
            this._ast = ast;
        });
        callback()
    }

    // 获取模块代码
    doBuild(compilation, callback) {
        let originalSource = this.getSource(this.resource, compilation);
        this._source = originalSource;
        callback();
    }

    getSource(resource, compilation) {
        let originalSource = compilation.inputFileSystem.readFileSync(resource, 'utf8');
        return originalSource;
    }
}

module.exports = NormalModule;
