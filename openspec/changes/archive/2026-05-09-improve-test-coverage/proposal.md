## 问题说明

全部 40 个单元测试均已失败（`TypeError: XXX is not a constructor`），覆盖率为 0%。`theme-manager.js` 没有任何测试文件。E2E 测试仅覆盖主题切换和持久化两个场景，缺少游戏核心玩法测试。当前状态无法验证代码正确性，任何修改都存在回归风险。

## 变更内容

- 修复源文件导入问题：在 `Minesweeper.js`、`renderer.js`、`theme-manager.js` 末尾添加 `module.exports` 双导出，保持 `window.XXX` 浏览器兼容
- 移动测试文件：`__tests__/*.test.js` → 与源文件同级目录（`Minesweeper.test.js`、`renderer.test.js`、`easterEgg.test.js`）
- 修正 Jest 配置：排除 `e2e/` 目录，修正 `testMatch` 规则
- 补充 `theme-manager.js` 单元测试：覆盖构造函数、主题切换、持久化等场景
- 补充 E2E 场景：游戏核心玩法（点击、标记、翻牌）、难度切换、笑脸按钮重置、计时器/地雷计数器

## 能力

### 新增能力
- `unit-testing`: 单元测试基础设施与规范，使 Jest 能正确测试浏览器全局导出的类
- `e2e-gameplay`: E2E 扫雷游戏核心玩法测试覆盖（初始化、点击、标旗、胜利检测、重置、计时）
- `theme-testing`: 主题管理器单元测试（切换、持久化、可用主题、无效输入处理）

### 修改的能力
<!-- 无现有规范被修改 -->

## 影响范围

| `src/js/Minesweeper.js` | 添加 module.exports 双导出 |
| `src/js/renderer.js` | 添加 module.exports 双导出 |
| `src/js/theme-manager.js` | 添加 module.exports 双导出 |
| `package.json` | Jest 配置修正（testMatch、testPathIgnorePatterns） |
| `src/js/` 目录 | 新增 4 个 *.test.js 文件，删除 __tests__/ 目录 |
| `e2e/tests/` 目录 | 新增游戏核心玩法 E2E 测试文件 |
| 测试目标 | 分支覆盖率 >95%，E2E 关键路径 95% 覆盖 |
