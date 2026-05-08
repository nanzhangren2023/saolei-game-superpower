// 扫雷游戏页面对象模型
// 用于封装游戏页面的所有交互和断言

export class GamePage {
  constructor(page) {
    this.page = page;
    // 主题选择器相关元素
    this.themeButton = page.locator('[data-testid="theme-selector"]');
    this.themeDropdown = page.locator('#theme-dropdown');
    this.themeNameDisplay = page.locator('#theme-name');

    // 游戏面板元素
    this.gameContainer = page.locator('.game-container');
    this.gameHeader = page.locator('.game-header');
    this.gameGrid = page.locator('.grid');
    this.cells = page.locator('.cell');

    // 状态指示器
    this.timer = page.locator('.timer');
    this.mineCounter = page.locator('.mine-counter');
    this.smileyButton = page.locator('[data-testid="smiley-button"]');
  }

  // 访问游戏页面
  async goto() {
    await this.page.goto('/');
    // 等待游戏初始化完成
    await this.gameContainer.waitFor({ state: 'visible' });
  }

  // 获取当前 html 的 class 属性（用于判断主题）
  async getCurrentThemeClass() {
    return this.page.evaluate(() => document.documentElement.className);
  }

  // 打开主题选择器
  async openThemeSelector() {
    await this.themeButton.click();
    await this.themeDropdown.waitFor({ state: 'visible' });
  }

  // 选择指定主题
  async selectTheme(themeKey) {
    const themeItem = this.themeDropdown.locator(`[data-theme="${themeKey}"]`);
    await themeItem.click();
    // 等待主题应用后下拉菜单关闭
    await this.themeDropdown.waitFor({ state: 'hidden' });
  }

  // 切换主题（完整流程）
  async switchTheme(themeKey) {
    await this.openThemeSelector();
    await this.selectTheme(themeKey);
    // 等待主题切换动画完成
    await this.page.waitForTimeout(350);
  }

  // 获取主题选择器是否可见
  async isDropdownVisible() {
    return this.themeDropdown.isVisible();
  }

  // 获取主题是否隐藏
  async isDropdownHidden() {
    return this.themeDropdown.isHidden();
  }

  // 获取主题选项列表
  getThemeOptions() {
    return this.themeDropdown.locator('.theme-option');
  }

  // 点击游戏网格区域（关闭下拉菜单）
  async clickOutsideDropdown() {
    await this.gameGrid.click({ position: { x: 10, y: 10 } });
  }

  // 验证游戏网格是否存在
  async isGridVisible() {
    return this.gameGrid.isVisible();
  }

  // 获取单元格数量
  async getCellCount() {
    return this.cells.count();
  }

  // 点击指定单元格
  async clickCell(row, col) {
    const cell = this.page.locator(`.cell[data-row="${row}"][data-col="${col}"]`);
    await cell.click();
  }

  // 右键点击指定单元格（标记旗帜）
  async rightClickCell(row, col) {
    const cell = this.page.locator(`.cell[data-row="${row}"][data-col="${col}"]`);
    await cell.click({ button: 'right' });
  }

  // 获取 localStorage 中的主题
  async getStoredTheme() {
    return this.page.evaluate(() => localStorage.getItem('minesweeper-theme'));
  }

  // 设置 localStorage 中的主题
  async setStoredTheme(themeKey) {
    await this.page.evaluate((theme) => {
      localStorage.setItem('minesweeper-theme', theme);
    }, themeKey);
  }

  // 清除 localStorage 中的主题
  async clearStoredTheme() {
    await this.page.evaluate(() => localStorage.removeItem('minesweeper-theme'));
  }

  // 清除所有 localStorage
  async clearAllStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // 刷新页面
  async reload() {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  // 获取页面背景颜色（用于验证主题颜色）
  async getBackgroundColor() {
    return this.gameHeader.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
  }

  // 获取计算样式属性
  async getComputedProperty(selector, property) {
    return this.page.evaluate(
      ({ sel, prop }) => {
        const el = document.querySelector(sel);
        return window.getComputedStyle(el).getPropertyValue(prop);
      },
      { sel: selector, prop: property }
    );
  }

  // 获取主题名称显示文本
  async getThemeNameText() {
    return this.themeNameDisplay.textContent();
  }

  // 获取当前主题图标（地雷图标）
  async getMineIcon() {
    return this.page.evaluate(() => {
      const cell = document.querySelector('.cell.mine');
      return cell ? cell.textContent.trim() : null;
    });
  }

  // 获取笑脸按钮图标
  async getSmileyIcon() {
    return this.smileyButton.textContent();
  }
}
