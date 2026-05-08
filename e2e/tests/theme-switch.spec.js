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
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-dark');

    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('dark');

    const themeName = await gamePage.getThemeNameText();
    expect(themeName).toBe('深色经典');
  });

  test('切换到 Windows 经典主题验证 class 正确', async ({ page }) => {
    await gamePage.switchTheme('classic');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-classic');

    const themeName = await gamePage.getThemeNameText();
    expect(themeName).toBe('Windows经典');

    // 验证 Windows 经典样式（直角）
    const borderRadius = await gamePage.getComputedProperty('.game-container', 'border-radius');
    expect(borderRadius).toBe('0px');
  });

  test('切换到太空主题验证图标更新', async ({ page }) => {
    await gamePage.switchTheme('space');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-space');

    const themeName = await gamePage.getThemeNameText();
    expect(themeName).toBe('太空探险');
  });

  test('切换到海洋主题验证颜色变化', async ({ page }) => {
    await gamePage.switchTheme('ocean');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-ocean');

    const bgColor = await gamePage.getBackgroundColor();
    expect(bgColor).toBeTruthy();

    const themeName = await gamePage.getThemeNameText();
    expect(themeName).toBe('海洋世界');
  });

  test('切换到糖果主题验证样式变化', async ({ page }) => {
    await gamePage.switchTheme('candy');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-candy');

    const borderRadius = await gamePage.getComputedProperty('.game-container', 'border-radius');
    expect(borderRadius).not.toBe('0px');

    const themeName = await gamePage.getThemeNameText();
    expect(themeName).toBe('糖果派对');
  });

  test('主题下拉菜单展开和关闭', async ({ page }) => {
    await expect(gamePage.themeDropdown).toBeHidden();

    await gamePage.openThemeSelector();
    await expect(gamePage.themeDropdown).toBeVisible();

    await gamePage.clickOutsideDropdown();
    await expect(gamePage.themeDropdown).toBeHidden();
  });

  test('主题选择器显示所有 5 个主题选项', async ({ page }) => {
    await gamePage.openThemeSelector();

    const options = gamePage.getThemeOptions();
    await expect(options).toHaveCount(5);

    const themeNames = await options.allTextContents();
    expect(themeNames).toContain('深色经典');
    expect(themeNames).toContain('Windows经典');
    expect(themeNames).toContain('太空探险');
    expect(themeNames).toContain('海洋世界');
    expect(themeNames).toContain('糖果派对');
  });

  test('当前主题高亮显示', async ({ page }) => {
    await gamePage.openThemeSelector();

    const activeTheme = gamePage.page.locator('.theme-option.active');
    await expect(activeTheme).toHaveCount(1);
    await expect(activeTheme).toHaveAttribute('data-theme', 'dark');

    await gamePage.selectTheme('ocean');
    await gamePage.openThemeSelector();
    await expect(activeTheme).toHaveAttribute('data-theme', 'ocean');
  });

  test('主题切换平滑无闪烁', async ({ page }) => {
    const beforeClass = await page.evaluate(() => document.documentElement.className);
    expect(beforeClass).toContain('theme-dark');

    await gamePage.switchTheme('candy');
    const afterClass = await page.evaluate(() => document.documentElement.className);
    expect(afterClass).toContain('theme-candy');

    expect(await gamePage.isGridVisible()).toBe(true);
    expect(await gamePage.getCellCount()).toBe(81);
  });
});
