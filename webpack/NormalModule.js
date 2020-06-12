class NormalModule {
    constructor({name, context, rawRequest, resource, parser}) {
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
        this.dependencies = []
    }

    build(compilation, callback) {
        callback()
    }
}

module.exports = NormalModule;
