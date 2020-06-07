class TestPlugin {
    apply(compiler) {
        compiler.hooks.environment.tap('TestPlugin', () => {
            console.log("TestPlugin")
        });

        compiler.hooks.afterEnvironment.tap('TestPlugin', () => {
            console.log("TestPlugin")
        });
    }
}

module.exports = TestPlugin;
