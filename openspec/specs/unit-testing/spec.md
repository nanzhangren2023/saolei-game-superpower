# 单元测试规范

## 目的

定义单元测试基础架构规范，确保 Jest 测试正确运行并维持高覆盖率。

## 需求

### 需求：Jest 应通过 module.exports 正确导入浏览器全局类

所有源文件（`Minesweeper.js`、`renderer.js`、`theme-manager.js`）在 Node.js 环境中应通过 `module.exports` 导出它们的类，同时保留浏览器环境中的 `window.XXX` 导出。

#### 场景：Minesweeper 类可在 Jest 测试中导入
- **当** 测试文件执行 `const Minesweeper = require('./Minesweeper')` 时
- **那么** `Minesweeper` 应是一个构造函数
- **那么** `new Minesweeper('beginner')` 应返回一个有效的游戏实例

#### 场景：renderer 类可在 Jest 测试中导入
- **当** 测试文件执行 `const Renderer = require('./renderer')` 时
- **那么** `Renderer` 应是一个构造函数
- **那么** `new Renderer(container)` 应返回一个有效的渲染器实例

#### 场景：theme-manager 类可在 Jest 测试中导入
- **当** 测试文件执行 `const ThemeManager = require('./theme-manager')` 时
- **那么** `ThemeManager` 应是一个构造函数
- **那么** `new ThemeManager()` 应返回一个有效的管理器实例

### 需求：Jest 应排除 E2E 测试文件

Jest 应仅扫描匹配 `src/js/**/?(*.)+(spec|test).js` 的文件，并排除 `e2e/` 和 `node_modules/` 目录中的文件。

#### 场景：E2E 文件不被 Jest 拾取
- **当** 执行 `npm test` 时
- **那么** `e2e/tests/` 中的文件不应被 Jest 执行
- **那么** 不应出现来自 Playwright 文件的 `Cannot use import statement outside a module` 错误

#### 场景：仅执行单元测试文件
- **当** 执行 `npm test` 时
- **那么** 仅应运行匹配 `src/js/**/*.test.js` 的文件
- **那么** `src/js/` 中的所有测试套件应在计算覆盖率前通过

### 需求：测试文件应与源文件放在同一目录

单元测试文件应放置在对应源文件所在的同一目录中，使用 `<filename>.test.js` 的命名约定。

#### 场景：测试文件与源文件相邻
- **当** 查看 `src/js/Minesweeper.js` 时
- **那么** `src/js/Minesweeper.test.js` 应存在于同一目录中

#### 场景：__tests__ 目录不应存在
- **当** 项目初始化时
- **那么** `src/js/__tests__/` 不应存在
- **那么** 所有测试文件应直接位于 `src/js/` 下

### 需求：单元测试分支覆盖率应超过 95%

代码库应在 `src/js/` 中的所有源文件中维持至少 95% 的分支覆盖率。

#### 场景：覆盖率报告显示 >95% 分支覆盖率
- **当** 执行 `npm test -- --coverage` 时
- **那么** 所有文件的 `Branch Coverage` 应 >= 95%
- **那么** 所有 40+ 个现有测试应通过
