## 1. 修复模块导出问题

- [x] 1.1 在 `src/js/Minesweeper.js` 末尾添加 `module.exports = Minesweeper` 条件导出
- [x] 1.2 在 `src/js/renderer.js` 末尾添加 `window.MinesweeperRenderer` 和 `module.exports` 条件导出
- [x] 1.3 在 `src/js/theme-manager.js` 末尾添加 `module.exports = ThemeManager` 条件导出

## 2. 移动测试文件并修正导入路径

- [x] 2.1 将 `src/js/__tests__/Minesweeper.test.js` 移动到 `src/js/Minesweeper.test.js`，修正 require 路径为 `./Minesweeper`
- [x] 2.2 将 `src/js/__tests__/renderer.test.js` 移动到 `src/js/renderer.test.js`，修正 require 路径
- [x] 2.3 将 `src/js/__tests__/easterEgg.test.js` 移动到 `src/js/easterEgg.test.js`，修正 require 路径
- [x] 2.4 删除 `src/js/__tests__/` 目录

## 3. 修正 Jest 配置

- [x] 3.1 在 `package.json` 的 jest 配置中添加 `testMatch: ["src/js/**/?(*.)+(spec|test).js"]`
- [x] 3.2 在 `package.json` 的 jest 配置中添加 `testPathIgnorePatterns: ["/e2e/", "/node_modules/"]`

## 4. 补充 theme-manager.js 单元测试

- [x] 4.1 创建 `src/js/theme-manager.test.js`，覆盖构造函数和默认主题
- [x] 4.2 添加 apply/switchTheme 测试（5 个主题切换）
- [x] 4.3 添加 localStorage 持久化测试（保存、恢复、默认值、无效值、静默失败）
- [x] 4.4 添加 getThemeIcon 和 getAvailableThemes 测试
- [x] 4.5 添加无效主题输入处理测试（空字符串、不存在 key）
- [x] 4.6 添加 updateSmiley 测试（各种游戏状态）

## 5. 补充 E2E 游戏核心玩法测试

- [x] 5.1 创建 `e2e/tests/game-core.spec.js`，添加游戏初始化测试
- [x] 5.2 添加单元格交互测试（左键点击、右键标记、取消标记）
- [x] 5.3 添加难度切换测试（初级、中级、高级网格尺寸验证）
- [x] 5.4 添加笑脸按钮重置测试
- [x] 5.5 添加计时器行为测试（启动、停止）
- [x] 5.6 添加首次点击安全保护测试
- [x] 5.7 添加 E2E page 对象方法（如需要扩充 `e2e/pages/game-page.js`）

## 6. 运行验证

- [x] 6.1 运行 `npm test -- --coverage` 确认所有测试通过
- [x] 6.2 确认分支覆盖率 Branch Coverage >= 95%
- [x] 6.3 运行 `npm run test:e2e` 确认所有 E2E 测试通过（Chromium）
- [x] 6.4 清理 `src/js/__tests__/` 目录确认已删除
