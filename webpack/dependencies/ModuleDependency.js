const Dependency = require("./Dependency");

class ModuleDependency extends Dependency {
    constructor(request) {
        super();
        this.request = request;
    }
}

module.exports = ModuleDependency;
