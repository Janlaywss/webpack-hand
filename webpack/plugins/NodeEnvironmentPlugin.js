const fs = require('fs');

// 环境初始化插件，初始化文件写入读取所需要的模块等其他nodejs环境信息
class NodeEnvironmentPlugin {
    apply(compiler) {
        compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs;
    }
}

module.exports = NodeEnvironmentPlugin;
