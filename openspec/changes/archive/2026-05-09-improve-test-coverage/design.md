## 背景

当前扫雷游戏代码使用浏览器全局变量导出（`window.Minesweeper = Minesweeper`），Jest 测试使用 CommonJS `require()` 导入，但源文件没有 `module.exports`，导致所有测试拿到 `undefined`。

测试文件集中在 `src/js/__tests__/` 目录，用户要求测试文件与源文件平级放置。

Jest 配置缺少 `testPathIgnorePatterns`，导致 E2E 文件被 Jest 当作单元测试执行并报错。

## 目标与非目标

**目标：**
- 使所有 40 个现有单元测试全部通过
- 单元测试分支覆盖率 >95%
- 测试文件与源文件平级（`Minesweeper.test.js` 与 `Minesweeper.js` 同级）
- 补充 theme-manager.js 单元测试
- 补充 E2E 游戏核心玩法测试
- Jest 与 E2E 测试隔离运行

**非目标：**
- 不重构为 ES Module 或 TypeScript
- 不改变浏览器端的 `window.XXX` 导出方式
- 不增加其他框架或构建工具

## 决策

### 1. 双导出方案：条件 `module.exports`

在源文件末尾添加条件导出：

```javascript
window.Minesweeper = Minesweeper;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Minesweeper;
}
```

**选择理由**：最小侵入式修改，浏览器和 Jest 双兼容。
**备选方案**：
- 改为 ES Module export → 需要修改 index.html 的 script 标签为 `type="module"`，成本高
- 使用 webpack/babel → 引入构建工具复杂度高

### 2. Jest 配置：testMatch 限定 src/js/

```json
"testMatch": ["src/js/**/?(*.)+(spec|test).js"],
"testPathIgnorePatterns": ["/e2e/", "/node_modules/"]
```

**选择理由**：精确控制 Jest 扫描范围，排除 E2E 文件。

### 3. 测试平级放置

```
src/js/
├── Minesweeper.js
├── Minesweeper.test.js
├── renderer.js
├── renderer.test.js
├── easterEgg.test.js
├── theme-manager.js
└── theme-manager.test.js
```

**导入路径**：`require('./Minesweeper')` 而非 `require('../Minesweeper')`

### 4. theme-manager.js 测试策略

由于 theme-manager.js 依赖 `localStorage` 和 `document.documentElement`，需要在 beforeEach 中 mock：

```javascript
beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
});
```

### 5. E2E 补充范围

在 `e2e/tests/` 新增 `game-core.spec.js`，覆盖：
- 页面加载 → 网格渲染 → 计数器显示
- 左键点击翻开格子
- 右键点击标记旗帜
- 难度切换验证网格尺寸
- 笑脸按钮重置
- 首次点击安全保护

## 风险与权衡

| 风险 | 缓解措施 |
|------|----------|
| `typeof module !== 'undefined'` 在某些 bundler 环境下可能触发 | 仅适用于 Jest 的 jsdom 环境，无 bundler，风险低 |
| theme-manager.js 的 CustomEvent 在 jsdom 中可能不支持 | jsdom 支持 CustomEvent，已在现有测试中使用 |
| localStorage mock 可能不真实 | Jest + jsdom 原生支持 localStorage |
| E2E 新增用例可能因 UI 变化而脆弱 | 使用 `data-testid` 属性定位元素 |
