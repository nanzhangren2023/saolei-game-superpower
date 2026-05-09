## 新增需求

### 需求：ThemeManager 应正确切换主题

当调用 `apply(themeKey)` 时，ThemeManager 应将正确的 CSS class 应用于 `document.documentElement`。

#### 场景：应用深色主题
- **当** 调用 `themeManager.apply('dark')` 时
- **那么** `document.documentElement.className` 应等于 `'theme-dark'`
- **那么** `themeManager.getCurrentTheme().name` 应等于 `'深色经典'`

#### 场景：应用经典主题
- **当** 调用 `themeManager.apply('classic')` 时
- **那么** `document.documentElement.className` 应等于 `'theme-classic'`
- **那么** `themeManager.getCurrentTheme().className` 应等于 `'theme-classic'`

#### 场景：应用太空主题
- **当** 调用 `themeManager.apply('space')` 时
- **那么** `document.documentElement.className` 应等于 `'theme-space'`
- **那么** 当前主题图标应包含太空主题的 emoji

#### 场景：应用海洋主题
- **当** 调用 `themeManager.apply('ocean')` 时
- **那么** `document.documentElement.className` 应等于 `'theme-ocean'`
- **那么** 当前主题应包含海洋主题图标

#### 场景：应用糖果主题
- **当** 调用 `themeManager.apply('candy')` 时
- **那么** `document.documentElement.className` 应等于 `'theme-candy'`
- **那么** 当前主题的地雷图标应为 `'💖'`

### 需求：无效的主题键应被静默忽略

ThemeManager 应优雅地处理无效或不存在的主题键，不抛出错误。

#### 场景：应用不存在的主题键
- **当** 调用 `themeManager.apply('nonexistent')` 时
- **那么** `document.documentElement.className` 不应改变
- **那么** 不应抛出错误

#### 场景：应用空字符串作为主题键
- **当** 调用 `themeManager.apply('')` 时
- **那么** `document.documentElement.className` 不应改变
- **那么** 不应抛出错误

### 需求：ThemeManager 应将主题持久化到 localStorage

ThemeManager 应使用 `localStorage` 保存和恢复选中的主题偏好。

#### 场景：saveTheme 将键存储到 localStorage
- **当** 调用 `themeManager.saveTheme('space')` 时
- **那么** `localStorage.getItem('minesweeper-theme')` 应等于 `'space'`

#### 场景：loadTheme 恢复已保存的主题
- **当** 在创建 ThemeManager 之前设置 `localStorage.setItem('minesweeper-theme', 'ocean')` 时
- **那么** `new ThemeManager().currentTheme` 应等于 `'ocean'`

#### 场景：未存储任何内容时 loadTheme 返回默认值 'dark'
- **当** `localStorage` 中没有 'minesweeper-theme' 键时
- **那么** `new ThemeManager().loadTheme()` 应返回 `'dark'`

#### 场景：存储了无效值时 loadTheme 返回默认值
- **当** 设置 `localStorage.setItem('minesweeper-theme', 'invalid')` 时
- **那么** `new ThemeManager().loadTheme()` 应返回 `'dark'`

#### 场景：localStorage 不可用时 saveTheme 静默失败
- **当** `localStorage.setItem` 抛出错误时
- **那么** `themeManager.saveTheme('dark')` 不应抛出异常
- **那么** 应用程序应继续正常运行

### 需求：ThemeManager 应返回正确的主题信息

ThemeManager 应提供关于可用主题和当前主题的准确信息。

#### 场景：getAllThemes 返回 5 个主题
- **当** 调用 `themeManager.getAllThemes()` 时
- **那么** 返回的对象应恰好有 5 个键
- **那么** 这些键应为: 'dark'、'classic'、'space'、'ocean'、'candy'

#### 场景：getCurrentTheme 返回当前主题对象
- **当** 调用 `themeManager.apply('space')` 后，再调用 `getCurrentTheme()` 时
- **那么** 返回的对象应具有 `name: '太空探险'` 和 `className: 'theme-space'`

#### 场景：getThemeIcon 返回正确的图标
- **当** 调用 `themeManager.apply('candy')` 时
- **那么** `themeManager.getThemeIcon('mine')` 应返回 `'💖'`
- **那么** `themeManager.getThemeIcon('flag')` 应返回 `'🎀'`

#### 场景：getThemeIcon 返回笑脸状态图标
- **当** 主题被应用时
- **那么** `themeManager.getThemeIcon('smiley', 'win')` 应返回该主题的胜利笑脸
- **那么** `themeManager.getThemeIcon('smiley', 'lose')` 应返回该主题的失败笑脸
- **那么** `themeManager.getThemeIcon('smiley', 'default')` 应返回该主题的默认笑脸
