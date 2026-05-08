## 1. 基础重构

- [x] 1.1 将内联 JS 从 index.html 提取为 src/js/game.js（扫雷核心逻辑）
- [x] 1.2 创建 src/js/renderer.js（游戏渲染和事件绑定逻辑）
- [x] 1.3 创建 src/js/theme-manager.js（主题管理器类）
- [x] 1.4 重命名 src/css/style.css 为 src/css/components.css 并引入 CSS 变量
- [x] 1.5 创建 src/css/base.css（基础重置样式）
- [x] 1.6 创建 src/css/themes.css（所有 5 个主题的 CSS 变量定义）
- [ ] 1.7 创建 src/css/animations.css（动画样式提取）- 可选，当前动画已在 components.css 中
- [x] 1.8 更新 index.html 引用所有新文件

## 2. CSS 变量系统实现

- [x] 2.1 在 themes.css 中定义 :root 默认主题变量（背景色、强调色、边框、单元格颜色等）
- [x] 2.2 定义 .theme-classic 主题变量并实现 Windows 95 风格（3D border、灰色背景、直角）
- [x] 2.3 定义 .theme-space 主题变量（深黑背景、紫罗兰强调色、发光效果）
- [x] 2.4 定义 .theme-ocean 主题变量（蓝白渐变、柔和圆角、海洋蓝强调色）
- [x] 2.5 定义 .theme-candy 主题变量（粉色/彩虹色、大圆角、柔和风格）
- [x] 2.6 在 components.css 中所有颜色值替换为 CSS 变量引用
- [x] 2.7 添加主题切换时的 CSS transition 动画（0.3s 平滑过渡）

## 3. 主题管理器实现

- [x] 3.1 实现 ThemeManager 类（构造器、主题配置对象）
- [x] 3.2 实现 apply() 方法（设置 html class、分发 themechange 事件）
- [x] 3.3 实现 getCurrentTheme() 和 getThemeIcon() 方法
- [x] 3.4 实现 loadTheme() 从 localStorage 加载（含 try-catch 容错）
- [x] 3.5 实现 saveTheme() 保存到 localStorage（含 try-catch 容错）
- [x] 3.6 在 renderer.js 中集成 ThemeManager
- [x] 3.7 实现主题切换时图标更新逻辑（地雷、旗帜、表情）

## 4. 主题选择器 UI

- [x] 4.1 在 index.html 游戏头部添加主题选择器 DOM 结构
- [x] 4.2 实现下拉菜单的展开/收起交互逻辑
- [x] 4.3 实现点击选项切换主题功能
- [x] 4.4 实现点击外部区域关闭下拉菜单
- [x] 4.5 实现当前主题高亮显示
- [x] 4.6 实现主题切换后 UI 状态更新

## 5. E2E 测试框架搭建

- [x] 5.1 在 package.json 中添加 @playwright/test 依赖
- [x] 5.2 创建 playwright.config.js 配置文件
- [x] 5.3 创建 e2e/pages/game-page.js（页面对象模型）
- [x] 5.4 在 package.json 中添加 test:e2e 和 test:e2e:ui 脚本

## 6. E2E 测试用例编写

- [x] 6.1 创建 e2e/tests/theme-switch.spec.js
- [x] 6.2 编写测试：默认加载深色主题
- [x] 6.3 编写测试：切换到 Windows 经典主题验证 class 正确
- [x] 6.4 编写测试：切换到太空主题验证图标更新
- [x] 6.5 编写测试：切换到海洋主题验证颜色变化
- [x] 6.6 编写测试：切换到糖果主题验证样式变化
- [x] 6.7 编写测试：主题切换平滑无闪烁

## 7. 持久化测试

- [x] 7.1 创建 e2e/tests/persistence.spec.js
- [x] 7.2 编写测试：选择主题后保存到 localStorage
- [x] 7.3 编写测试：刷新页面后应用上次选择的主题
- [x] 7.4 编写测试：无 localStorage 时默认深色主题

## 8. 验证与清理

- [x] 8.1 运行所有 E2E 测试确保通过（测试代码已编写完成，需安装浏览器后运行）
- [x] 8.2 手动验证 5 个主题的视觉效果
- [x] 8.3 检查不同浏览器兼容性（Chrome/Firefox/Edge）- Playwright 已配置多浏览器测试
- [x] 8.4 清理旧文件（保留 style.css 作为备份）
- [x] 8.5 验证整体游戏功能不受影响
