class Chunk {
    constructor(module) {
        this.entryModule = module;
        this.name = module.name;
        this.files = [];
        this.modules = [];
        this.async = module.async;
    }
}

module.exports = Chunk;
