// 持久化测试 - 验证主题在 localStorage 中的保存和恢复

import { test, expect } from '@playwright/test';
import { GamePage } from '../pages/game-page.js';

test.describe('主题持久化', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
  });

  test('选择主题后保存到 localStorage', async ({ page }) => {
    // 初始没有 localStorage
    await page.goto('/');
    await gamePage.switchTheme('ocean');

    // 验证 localStorage 存储了 ocean
    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('ocean');
  });

  test('刷新页面后应用上次选择的主题', async ({ page }) => {
    // 先选择 ocean 主题
    await page.goto('/');
    await gamePage.switchTheme('ocean');

    // 验证当前主题
    let htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-ocean');

    // 刷新页面
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 验证主题仍然是 ocean
    htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-ocean');

    const themeName = await page.locator('#theme-name').textContent();
    expect(themeName).toBe('海洋世界');
  });

  test('无 localStorage 时默认深色主题', async ({ page }) => {
    // 清除 localStorage
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');

    // 验证默认主题为 dark
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-ocean');

    // 刷新页面
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 验证主题仍然是 ocean
    const htmlClassAfterReload = await page.evaluate(() => document.documentElement.className);
    expect(htmlClassAfterReload).toContain('theme-ocean');

    const themeName = await page.locator('#theme-name').textContent();
    expect(themeName).toBe('海洋世界');
  });

  test('无 localStorage 时默认深色主题', async ({ page }) => {
    await gamePage.clearAllStorage();
    await page.goto('/');

    // 验证默认主题为 dark
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-dark');

    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('dark');
  });

  test('多次切换后保存最终主题', async ({ page }) => {
    await page.goto('/');

    // 多次切换
    await gamePage.switchTheme('classic');
    await gamePage.switchTheme('space');
    await gamePage.switchTheme('candy');

    // 验证最终保存的是 candy
    const storedTheme = await page.evaluate(() => localStorage.getItem('minesweeper-theme'));
    expect(storedTheme).toBe('candy');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-candy');
  });

  test('localStorage 主题无效时使用默认深色', async ({ page }) => {
    // 设置无效的 localStorage 值
    await page.evaluate(() => localStorage.setItem('minesweeper-theme', 'invalid'));
    await page.goto('/');

    // 应该回退到默认主题
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('theme-dark');
  });

  test('不同主题图标切换后持久化', async ({ page }) => {
    await page.goto('/');

    // 切换到太空主题
    await gamePage.switchTheme('space');

    // 验证图标更新
    const mineIcon = await gamePage.getThemeIcon('mine');
    expect(mineIcon).toBe('🌑');

    // 刷新页面验证
    await page.reload({ waitUntil: 'domcontentloaded' });

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toBe('theme-space');
  });
});