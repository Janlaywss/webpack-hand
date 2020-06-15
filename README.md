# webpack-hand
从 0-1 实现 webpack

### 进展

#### Part1: 基础框架与代码模版

1. 测试环境的搭建
2. 提取webpack hamory runtime 模版
3. 初始化tapable环境
4. 初始化基础插件，支持单entry能力，监听make事件


#### Part2: 打通主流程

1. 初始化 Compilation 对象
2. 初始化 NormalModuleFactory 普通模块工厂
3. 初始化 Stats 数据统计对象
4. 打通主流程

#### Part3: 最后编译准备

1. 初始化 Parser 类
2. 递归构建流程
3. 初始化模块信息

#### Part4: 开始编译

1. 接入babylon进行ast解析
2. require函数转换
3. 接入 neo-async 进行递归编译

#### Part5: 编译结束并产出文件

1. seal 钩子 + 生成代码块
2. 使用ejs写入文件系统
3. emit钩子
