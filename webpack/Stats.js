class Stats {
    constructor(compilation) {
        this.entries = compilation.entries;
        this.modules = compilation.modules;
    }

    toJson() {
        return JSON.stringify(this)
    }
}

module.exports = Stats;
