## ADDED Requirements

### Requirement: 主题管理器核心功能

系统必须提供一个 ThemeManager 类，用于管理主题配置、应用和状态。

ThemeManager 必须：
- 维护 5 个预定义主题的注册表：dark、classic、space、ocean、candy
- 提供方法来应用、获取当前和列出可用主题
- 在应用主题时分发 `themechange` 自定义事件

#### Scenario: 初始化主题管理器
- **WHEN** ThemeManager 被实例化时
- **THEN** 它应从持久化存储加载已保存的主题，或默认为 'dark'

#### Scenario: 应用有效主题
- **WHEN** 调用 ThemeManager.apply('space') 时
- **THEN** `<html>` 的 class 应设置为 'theme-space'
- **AND** 应分发带有主题详情的 `themechange` 事件

#### Scenario: 应用无效主题
- **WHEN** 调用 ThemeManager.apply('nonexistent') 时
- **THEN** 不应应用任何更改
- **AND** 不应抛出错误

#### Scenario: 获取当前主题信息
- **WHEN** 调用 ThemeManager.getCurrentTheme() 时
- **THEN** 应返回当前主题对象，包含 name、className 和 icons

#### Scenario: 获取主题图标
- **WHEN** 调用 ThemeManager.getThemeIcon('smiley', 'win') 且当前为 'space' 主题时
- **THEN** 应返回 '🤩'

### Requirement: 主题配置定义

系统必须定义 5 个具有不同视觉配置的主题。

每个主题必须包含：
- 唯一的键名（dark、classic、space、ocean、candy）
- 显示名称（如 '深色经典'、'Windows经典'）
- CSS 类名（如 'theme-dark'、'theme-classic'）
- 用于 mine、flag 和 smiley 状态的图标映射

#### Scenario: 深色主题配置
- **WHEN** 查询 'dark' 主题时
- **THEN** className 应为 'theme-dark'
- **AND** 地雷图标应为 '💣'
- **AND** 旗帜图标应为 '🚩'
- **AND** 默认表情应为 '😊'

#### Scenario: 太空主题配置
- **WHEN** 查询 'space' 主题时
- **THEN** className 应为 'theme-space'
- **AND** 地雷图标应为 '🌑'
- **AND** 旗帜图标应为 '⭐'
- **AND** 默认表情应为 '👨‍🚀'

#### Scenario: 海洋主题配置
- **WHEN** 查询 'ocean' 主题时
- **THEN** className 应为 'theme-ocean'
- **AND** 地雷图标应为 '⚓'
- **AND** 旗帜图标应为 '🎏'
- **AND** 默认表情应为 '🤿'

#### Scenario: 糖果主题配置
- **WHEN** 查询 'candy' 主题时
- **THEN** className 应为 'theme-candy'
- **AND** 地雷图标应为 '💖'
- **AND** 旗帜图标应为 '🎀'
- **AND** 默认表情应为 '🎀'

#### Scenario: 经典主题配置
- **WHEN** 查询 'classic' 主题时
- **THEN** className 应为 'theme-classic'
- **AND** 地雷图标应为 '💣'
- **AND** 旗帜图标应为 '🚩'
- **AND** 默认表情应为 '😊'
