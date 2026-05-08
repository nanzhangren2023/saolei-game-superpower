// 持久化测试 - 验证主题在 localStorage 中的保存和恢复

import { test, expect } from '@playwright/test';
import { GamePage } from '../pages/game-page.js';

test.describe('主题持久化', () => {
  let gamePage;

  test('选择主题后保存到 localStorage', async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.switchTheme('ocean');

    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('ocean');
  });

  test('刷新页面后应用上次选择的主题', async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.switchTheme('ocean');

    const htmlClassBefore = await page.evaluate(() => document.documentElement.className);
    expect(htmlClassBefore).toContain('theme-ocean');

    await page.reload({ waitUntil: 'domcontentloaded' });

    const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
    expect(htmlClassAfter).toContain('theme-ocean');

    const themeName = await page.locator('#theme-name').textContent();
    expect(themeName).toBe('海洋世界');
  });

  test('无 localStorage 时默认深色主题', async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearAllStorage();
    await gamePage.goto();

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-dark');

    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('dark');
  });

  test('多次切换后保存最终主题', async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();

    await gamePage.switchTheme('classic');
    await gamePage.switchTheme('space');
    await gamePage.switchTheme('candy');

    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('candy');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-candy');
  });

  test('localStorage 主题无效时使用默认深色', async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.clearAllStorage();

    // 设置无效的 localStorage 值
    await page.evaluate(() => localStorage.setItem('minesweeper-theme', 'invalid'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-dark');
  });

  test('不同主题图标切换后持久化', async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.switchTheme('space');

    const htmlClassBefore = await page.evaluate(() => document.documentElement.className);
    expect(htmlClassBefore).toContain('theme-space');

    const themeName = await gamePage.getThemeNameText();
    expect(themeName).toBe('太空探险');

    await page.reload({ waitUntil: 'domcontentloaded' });

    const htmlClassAfter = await page.evaluate(() => document.documentElement.className);
    expect(htmlClassAfter).toContain('theme-space');
  });
});
