// E2E 游戏核心玩法测试

import { test, expect } from '@playwright/test';
import { GamePage } from '../pages/game-page.js';

test.describe('游戏初始化', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('加载页面后游戏容器可见', async ({ page }) => {
    await expect(gamePage.gameContainer).toBeVisible();
  });

  test('网格包含 81 个单元格（初级 9x9）', async () => {
    const cellCount = await gamePage.getCellCount();
    expect(cellCount).toBe(81);
  });

  test('难度选择器按钮可见', async () => {
    await expect(gamePage.beginnerBtn).toBeVisible();
    await expect(gamePage.intermediateBtn).toBeVisible();
    await expect(gamePage.expertBtn).toBeVisible();
  });

  test('地雷计数器显示 010', async () => {
    const text = await gamePage.getMineCounterText();
    expect(text).toBe('010');
  });

  test('计时器显示 000', async () => {
    const text = await gamePage.getTimerText();
    expect(text).toBe('000');
  });

  test('笑脸按钮可见', async () => {
    await expect(gamePage.smileyButton).toBeVisible();
  });
});

test.describe('单元格交互', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('左键点击揭示安全单元格', async () => {
    // 第一次点击保证安全，游戏应该不会结束
    await gamePage.clickCell(0, 0);

    const isGameOver = await gamePage.isGameOver();
    expect(isGameOver).toBe(false);

    // 单元格应该被揭示
    const isRevealed = await gamePage.isCellRevealed(0, 0);
    expect(isRevealed).toBe(true);
  });

  test('右键点击标记旗帜', async () => {
    await gamePage.rightClickCell(3, 3);

    const isFlagged = await gamePage.isCellFlagged(3, 3);
    expect(isFlagged).toBe(true);

    const text = await gamePage.getCellText(3, 3);
    expect(text).toBeTruthy();
  });

  test('再次右键点击取消标记', async () => {
    await gamePage.rightClickCell(3, 3);
    await gamePage.rightClickCell(3, 3);

    const isFlagged = await gamePage.isCellFlagged(3, 3);
    expect(isFlagged).toBe(false);
  });

  test('点击已揭示的单元格无变化', async () => {
    const mineCounterBefore = await gamePage.getMineCounterText();

    // 先揭示一个单元格
    await gamePage.clickCell(4, 4);

    const isRevealed = await gamePage.isCellRevealed(4, 4);
    expect(isRevealed).toBe(true);

    // 再次点击
    await gamePage.clickCell(4, 4);

    const mineCounterAfter = await gamePage.getMineCounterText();
    expect(mineCounterAfter).toBe(mineCounterBefore);
  });
});

test.describe('难度切换', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('切换到中级难度（16x16 = 256 单元格）', async () => {
    await gamePage.setDifficulty('intermediate');
    // 等待网格重新渲染
    await gamePage.page.waitForTimeout(500);
    // 等待游戏容器可见
    await gamePage.gameContainer.waitFor({ state: 'visible' });

    const cellCount = await gamePage.getCellCount();
    expect(cellCount).toBe(256);

    const mineCounter = await gamePage.getMineCounterText();
    expect(mineCounter).toBe('040');
  });

  test('切换到高级难度（16x30 = 480 单元格）', async () => {
    await gamePage.setDifficulty('expert');
    // 等待网格重新渲染
    await gamePage.page.waitForTimeout(500);
    // 等待游戏容器可见
    await gamePage.gameContainer.waitFor({ state: 'visible' });

    const cellCount = await gamePage.getCellCount();
    expect(cellCount).toBe(480);

    const mineCounter = await gamePage.getMineCounterText();
    expect(mineCounter).toBe('099');
  });

  test('切换回初级难度（9x9 = 81 单元格）', async () => {
    await gamePage.setDifficulty('expert');
    await gamePage.setDifficulty('beginner');

    const cellCount = await gamePage.getCellCount();
    expect(cellCount).toBe(81);

    const mineCounter = await gamePage.getMineCounterText();
    expect(mineCounter).toBe('010');
  });
});

test.describe('笑脸按钮重置', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('点击笑脸按钮重置游戏', async () => {
    // 揭示一个单元格
    await gamePage.clickCell(4, 4);
    const cellRevealed = await gamePage.isCellRevealed(4, 4);
    expect(cellRevealed).toBe(true);

    // 标记一个单元
    await gamePage.rightClickCell(3, 3);

    // 点击笑脸按钮
    await gamePage.clickSmiley();

    // 所有应该回到初始状态
    const cellRevealedAfter = await gamePage.isCellRevealed(4, 4);
    expect(cellRevealedAfter).toBe(false);

    const cellFlaggedAfter = await gamePage.isCellFlagged(3, 3);
    expect(cellFlaggedAfter).toBe(false);

    const timerText = await gamePage.getTimerText();
    expect(timerText).toBe('000');

    const mineCounter = await gamePage.getMineCounterText();
    expect(mineCounter).toBe('010');
  });
});

test.describe('计时器行为', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('第一次点击后计时 器启动', async ({ page }) => {
    expect(await gamePage.getTimerText()).toBe('000');

    await gamePage.clickCell(0, 0);

    // 等待 1.5 秒让计时器增加
    await page.waitForTimeout(1500);

    const timerText = await gamePage.getTimerText();
    expect(timerText).not.toBe('000');
  });

  test('踩中地雷后计时器停止', async ({ page }) => {
    await gamePage.clickCell(0, 0);

    // 等待计时器启动
    await page.waitForTimeout(1200);
    const timerBefore = await gamePage.getTimerText();

    // 踩一个地雷（假设踩到地雷游戏结束）
    // 注意：由于首次点击安全保护，需要多次点击来碰到地雷
    // 使用合法坐标 (0-8) for beginner mode
    for (let i = 0; i < 8; i++) {
      const row = Math.floor(i / 3);
      const col = (i % 3) + 1;
      await gamePage.clickCell(row, col);
      if (await gamePage.isGameOver()) break;
    }

    // 如果游戏结束了，计时器应保持不变
    if (await gamePage.isGameOver()) {
      await page.waitForTimeout(1500);
      const timerAfter = await gamePage.getTimerText();
      expect(timerAfter).toBe(timerBefore);
    }
  });
});

test.describe('首次点击安全保护', () => {
  let gamePage;

  test.beforeEach(async ({ page }) => {
    gamePage = new GamePage(page);
    await gamePage.goto();
  });

  test('第一次点击永远不会是地雷', async ({ page }) => {
    await gamePage.clickCell(4, 4);

    // 游戏不应该结束
    const isGameOver = await gamePage.isGameOver();
    expect(isGameOver).toBe(false);

    // 点击的单元格应该被揭示，且不是地雷
    const text = await gamePage.getCellText(4, 4);
    const cellClass = await page.locator('.cell[data-row="4"][data-col="4"]').getAttribute('class');
    expect(cellClass).not.toContain('mine');
  });
});
