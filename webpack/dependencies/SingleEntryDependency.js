const ModuleDependency = require("./ModuleDependency");

// 单入口模块依赖
class SingleEntryDependency extends ModuleDependency {
    constructor(request) {
        super(request);
    }

    get type() {
        return "single entry";
    }
}

module.exports = SingleEntryDependency;
