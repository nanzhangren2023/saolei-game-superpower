## ADDED Requirements

### Requirement: 主题持久化

系统必须使用 localStorage 保存和恢复用户的主题偏好设置。

持久化机制必须：
- 在新主题被应用时将主题键保存到 localStorage
- 在应用程序启动时加载已保存的主题
- 如果没有已保存的偏好，默认为 'dark' 主题
- 优雅处理 localStorage 错误（如私密浏览模式）

储存键：`minesweeper-theme`

#### Scenario: 切换主题时保存
- **WHEN** 用户选择 'ocean' 主题时
- **THEN** localStorage 应存储 `{键: 'minesweeper-theme', 值: 'ocean'}`

#### Scenario: 启动时加载已保存的主题
- **WHEN** 应用程序初始化时
- **AND** localStorage 中包含 `minesweeper-theme: 'space'`
- **THEN** 应自动应用 'space' 主题
- **AND** `<html>` class 应为 'theme-space'

#### Scenario: 无已保存偏好时使用默认主题
- **WHEN** 应用程序初始化时
- **AND** localStorage 中没有 `minesweeper-theme` 条目
- **THEN** 应应用 'dark' 主题
- **AND** `<html>` class 应为 'theme-dark'

#### Scenario: 优雅处理 localStorage 不可用
- **WHEN** localStorage 不可用时（如浏览器安全设置）
- **AND** 应用程序尝试保存主题时
- **THEN** 不应导致应用程序崩溃
- **AND** 当前会话中主题仍应正确应用

#### Scenario: 主题在页面刷新后持久化
- **WHEN** 用户设置主题为 'candy'
- **AND** 用户刷新页面
- **THEN** 'candy' 主题应在刷新后处于激活状态
- **AND** 主题选择器应显示 '糖果派对' 为已选中
