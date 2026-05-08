## Context

当前扫雷游戏的样式系统存在以下问题：

1. **单体样式文件** - 所有样式硬编码在 `src/css/style.css` 中，没有 CSS 变量
2. **内联 JavaScript** - 游戏渲染逻辑以 210+ 行内联 `<script>` 嵌入 `index.html`
3. **图标硬编码** - emoji 图标（💣、🚩、😊）直接写在 JS 字符串中
4. **单主题限制** - 用户无法自定义游戏外观

约束条件：
- 项目为纯静态前端（无构建工具）
- 商用级别质量要求
- 需要 E2E 测试覆盖

## Goals / Non-Goals

**Goals:**
- 实现基于 CSS Custom Properties 的主题系统
- 支持 5 个预设主题：深色经典、Windows 经典、太空探险、海洋世界、糖果派对
- 实现主题切换 UI（下拉菜单）
- 实现 localStorage 持久化
- 将内联 JS/CSS 分离到独立文件
- 使用 Playwright 编写 E2E 测试

**Non-Goals:**
- 不做复杂图标系统（SVG/Icon Font），仅使用 emoji 映射
- 不做云端主题市场或自定义主题编辑器
- 不做后端集成或用户账户系统
- 不做国际化（i18n）

## Decisions

### 1. CSS 架构：单 themes.css 文件

将所有主题的 CSS 变量定义在 `src/css/themes.css` 中。

**理由：** 项目无构建工具，纯静态部署；5 个主题总量可控；切换只需改 class，无需额外请求。

### 2. JS 架构：三文件分离

| 文件 | 职责 |
|------|------|
| `game.js` | 扫雷核心逻辑（网格生成、地雷分布、揭示算法） |
| `renderer.js` | DOM 渲染、事件绑定、UI 更新 |
| `theme-manager.js` | 主题加载、应用、持久化、事件分发 |

### 3. 图标系统：JS 对象映射

`themeManager.getThemeIcon(type, state)` 方法获取图标。随主题切换由 JS 批量更新 DOM。

### 4. 主题切换 UI：下拉菜单

位置：游戏面板右上角，标题右侧。使用原生 JS 实现下拉。

### 5. Windows 经典主题：border 组合 3D 效果

```css
.theme-classic .cell {
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #808080;
  border-right: 2px solid #808080;
  background: #c0c0c0;
  border-radius: 0;
}
```

### 6. E2E 测试：Playwright

使用 Playwright，支持多浏览器和静态页面测试。

## Risks / Trade-offs

### [性能] CSS 全部加载 vs 按需加载
**缓解：** 预计增量 < 15KB，影响可忽略。

### [维护] 单 themes.css 可能变大
**缓解：** 超过 1000 行时评估拆分。

### [Windows 经典] 边框样式兼容性
**缓解：** 高 CSS 特异性覆盖；Chrome/Firefox/Edge 测试。

### [E2E] emoji 渲染跨平台不一致
**缓解：** 测试 `textContent` 值，不做视觉截图对比。

### [持久化] localStorage 兼容性
**缓解：** try-catch 回退到默认主题。

## Migration Plan

1. 新增文件，不影响现有功能
2. 更新 `index.html` 引用新文件
3. 主题系统默认激活深色主题
4. E2E 测试验证

回滚：保留 `style.css`，回退 `index.html` 即可。
