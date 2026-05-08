// 主题切换测试 - 验证所有 5 个主题切换功能

import { test, expect } from '@playwright/test';
import { GamePage } from '../pages/game-page.js';

test.describe('主题切换功能', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('默认加载深色主题', async ({ page }) => {
    // 验证默认主题为深色
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-dark');

    // 验证 localStorage 存储了 dark
    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('dark');

    // 验证主题选择器显示 "深色经典"
    const themeName = await gamePage.currentThemeIcon.locator('#theme-name').textContent();
    expect(themeName).toBe('深色经典');
  });

  test('切换到 Windows 经典主题验证 class 正确', async ({ page }) => {
    await gamePage.switchTheme('classic');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-classic');

    const themeName = await gamePage.page.locator('#theme-name').textContent();
    expect(themeName).toBe('Windows经典');

    // 验证 Windows 经典样式（直角）
    const borderRadius = await gamePage.getComputedProperty('.game-container', 'border-radius');
    expect(borderRadius).toBe('0px');
  });

  test('切换到太空主题验证图标更新', async ({ page }) => {
    await gamePage.switchTheme('space');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-space');

    // 验证太空主题图标（地雷应该是月亮 🌑）
    const mineIcon = gamePage.getThemeIcon('mine');
    expect(mineIcon).toBe('🌑');

    // 验证主题名称显示
    const themeName = await gamePage.page.locator('#theme-name').textContent();
    expect(themeName).toBe('太空探险');
  });

  test('切换到海洋主题验证颜色变化', async ({ page }) => {
    await gamePage.switchTheme('ocean');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-ocean');

    // 验证海洋主题颜色（使用特定的 CSS 变量）
    const bgContainer = await gamePage.page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--bg-container');
    });
    expect(bgContainer.trim()).toBeTruthy();

    const themeName = await gamePage.page.locator('#theme-name').textContent();
    expect(themeName).toBe('海洋世界');
  });

  test('切换到糖果主题验证样式变化', async ({ page }) => {
    await gamePage.switchTheme('candy');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-candy');

    // 验证糖果主题的大圆角
    const borderRadius = await gamePage.getComputedProperty('.game-container', 'border-radius');
    expect(borderRadius).not.toBe('0px');

    const themeName = await gamePage.page.locator('#theme-name').textContent();
    expect(themeName).toBe('糖果派对');
  });

  test('主题下拉菜单展开和关闭', async ({ page }) => {
    // 初始状态下拉菜单应隐藏
    const dropdownHidden = await gamePage.themeDropdown.isHidden();
    expect(dropdownHidden).toBe(true);

    // 打开下拉菜单
    await gamePage.openThemeSelector();
    const dropdownVisible = await gamePage.themeDropdown.isVisible();
    expect(dropdownVisible).toBe(true);

    // 点击外部关闭
    await gamePage.clickOutsideDropdown();
    await gamePage.themeDropdown.waitFor({ state: 'hidden' });
    const dropdownClosed = await gamePage.themeDropdown.isHidden();
    expect(dropdownClosed).toBe(true);
  });

  test('主题选择器显示所有 5 个主题选项', async ({ page }) => {
    await gamePage.openThemeSelector();

    const options = gamePage.getThemeOptions();
    await expect(options).toHaveCount(5);

    // 验证主题名称存在
    const themeNames = await options.allTextContents();
    expect(themeNames).toContain('深色经典');
    expect(themeNames).toContain('Windows经典');
    expect(themeNames).toContain('太空探险');
    expect(themeNames).toContain('海洋世界');
    expect(themeNames).toContain('糖果派对');
  });

  test('当前主题高亮显示', async ({ page }) => {
    await gamePage.openThemeSelector();

    // 默认 dark 主题应有 active 状态
    const activeTheme = gamePage.page.locator('.theme-option.active');
    await expect(activeTheme).toHaveCount(1);
    await expect(activeTheme).toHaveAttribute('data-theme', 'dark');

    // 切换到 ocean 后，active 应更新
    await gamePage.selectTheme('ocean');
    await gamePage.openThemeSelector();
    await expect(activeTheme).toHaveAttribute('data-theme', 'ocean');
  });

  test('主题切换平滑无闪烁', async ({ page }) => {
    // 记录切换前的样式
    const beforeClass = await page.evaluate(() => document.documentElement.className);

    // 切换主题
    await gamePage.switchTheme('candy');
    const afterClass = await page.evaluate(() => document.documentElement.className);

    // class 应立即更新
    expect(beforeClass).toBe('theme-dark');
    expect(afterClass).toBe('theme-candy');

    // 验证游戏状态不变（网格仍然可见）
    expect(await gamePage.isGridVisible()).toBe(true);
    expect(await gamePage.getCellCount()).toBe(81);
  });
});
