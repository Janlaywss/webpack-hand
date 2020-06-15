class Stats {
    constructor(compilation) {
        this.entries = compilation.entries;
        this.modules = compilation.modules;
        this.chunks = compilation.chunks;
    }

    toJson() {
        return JSON.stringify(this)
    }
}

module.exports = Stats;
