class TestPlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap('TestPlugin', (compilation) => {
            compilation.hooks.buildModule.tap('TestPlugin', (module) => {
                console.log("buildModule", module.name);
            })
            compilation.hooks.succeedModule.tap('TestPlugin', (module) => {
                console.log("succeedModule", module.name);
            })
        })
    }
}

module.exports = TestPlugin;
