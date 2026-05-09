# 项目规则

## 语言规范

- **所有文档必须使用中文**：包括设计规范、README、注释等
- **代码注释和命名**：使用英文（遵循国际惯例）

## 目录结构

```
项目根目录/
├── docs/                  # 文档目录
│   └── superpowers/
│       └── specs/         # 设计规范
├── src/                   # 源代码目录
│   ├── css/               # 样式文件
│   │   ├── base.css       # 基础重置样式
│   │   ├── themes.css     # 主题 CSS 变量
│   │   └── components.css # 使用变量的组件样式
│   └── js/                # JavaScript 文件
│       ├── Minesweeper.js # 扫雷核心逻辑
│       ├── renderer.js    # 渲染与事件绑定
│       ├── theme-manager.js # 主题管理器
│       └── *.test.js      # 单元测试（与源文件同级）
├── e2e/                   # E2E 测试
│   ├── pages/             # 页面对象
│   └── tests/             # E2E 测试用例
├── openspec/              # OpenSpec 规范目录
│   ├── specs/             # 主规范文件
│   └── changes/           # 变更及归档
├── index.html             # 入口文件
└── package.json           # 依赖与脚本配置
```

## 规范要求

1. 所有非代码文件必须使用中文编写
2. 代码中的注释可以使用中文或英文
3. 保持代码简洁，无需不必要的注释
4. 测试文件与源文件平级放置（`*.test.js` 与源文件相邻）

## TDD 开发模式

- **先写测试，再写实现代码**
- 测试必须先失败，然后编写最小化代码使其通过
- 遵循 Red-Green-Refactor 循环：
  1. RED：编写失败的测试
  2. GREEN：编写最小化代码使测试通过
  3. REFACTOR：重构优化代码
- 测试文件放在与源文件同级目录（如 `src/js/Minesweeper.test.js` 与 `src/js/Minesweeper.js` 同级）
- 使用 Jest 作为测试框架
- 单元测试分支覆盖率要求 >= 95%
