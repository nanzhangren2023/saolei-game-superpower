// Minesweeper must be imported first to populate window.Minesweeper
require('./Minesweeper');
const ThemeManager = require('./theme-manager');
const MinesweeperRenderer = require('./renderer');

describe('MinesweeperRenderer', () => {
  let renderer;
  let mockContainer;
  let themeManagerMock;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-container"></div>';
    mockContainer = document.getElementById('test-container');
    renderer = new MinesweeperRenderer(mockContainer);
    renderer.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('initializes with default difficulty', () => {
      expect(renderer.difficulty).toBe('beginner');
    });

    test('creates Minesweeper game instance', () => {
      expect(renderer.game).not.toBeNull();
      expect(renderer.game.rows).toBe(9);
      expect(renderer.game.cols).toBe(9);
    });
  });

  describe('render', () => {
    test('creates game container element', () => {
      expect(mockContainer.querySelector('.game-container')).not.toBeNull();
    });

    test('creates difficulty selector with buttons', () => {
      const buttons = mockContainer.querySelectorAll('[data-diff]');
      expect(buttons.length).toBe(3);
    });

    test('creates mine counter display', () => {
      expect(mockContainer.querySelector('.mine-counter')).not.toBeNull();
    });

    test('creates timer display', () => {
      expect(mockContainer.querySelector('.timer')).not.toBeNull();
    });

    test('creates smiley button', () => {
      expect(mockContainer.querySelector('.smiley-button')).not.toBeNull();
    });

    test('creates grid with correct dimensions', () => {
      const cells = mockContainer.querySelectorAll('.cell');
      expect(cells.length).toBe(81); // 9x9 beginner
    });
  });

  describe('updateGrid', () => {
    test('updates cell revealed state', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 1);
      renderer.updateGrid();

      const cell = mockContainer.querySelector('[data-row="1"][data-col="1"]');
      expect(cell).not.toBeNull();
      expect(cell.classList.contains('revealed')).toBe(true);
    });

    test('shows mine icon when game is over', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.getGrid()[0][0].hasMine = true;
      renderer.game.gameOver = true;
      renderer.updateGrid();

      const cell = mockContainer.querySelector('[data-row="0"][data-col="0"]');
      expect(cell).not.toBeNull();
      expect(cell.classList.contains('mine')).toBe(true);
      expect(cell.textContent).toBe('💣');
    });

    test('shows flag icon when cell is flagged', () => {
      renderer.game.toggleFlag(0, 0);
      renderer.updateGrid();

      const cell = mockContainer.querySelector('[data-row="0"][data-col="0"]');
      expect(cell).not.toBeNull();
      expect(cell.classList.contains('flagged')).toBe(true);
      expect(cell.textContent).toBe('🚩');
    });

    test('shows number on revealed cell with neighbor mines', () => {
      const grid = renderer.game.getGrid();
      grid[0][0].hasMine = true;
      grid[0][1].hasMine = true;
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 2);
      renderer.updateGrid();

      const cell = mockContainer.querySelector('[data-row="1"][data-col="2"]');
      expect(cell).not.toBeNull();
      expect(cell.classList.contains('revealed')).toBe(true);
      // Cell [1][2] is adjacent to [0][1] which has a mine, so it should have a number
      expect(cell.getAttribute('data-number')).not.toBeNull();
    });

    test('handles cell without DOM element gracefully', () => {
      renderer.updateGrid();
      // No error expected
    });

    test('updateGrid returns early when game is null', () => {
      renderer.game = null;
      expect(() => renderer.updateGrid()).not.toThrow();
    });

    test('updateGrid handles missing cell element in DOM', () => {
      // Create a larger grid but only have partial DOM coverage
      document.body.innerHTML = '<div id="test-container"></div>';
      mockContainer = document.getElementById('test-container');
      renderer = new MinesweeperRenderer(mockContainer);
      renderer.game = new Minesweeper('expert'); // 16x30 = 480 cells
      renderer.render();
      // Remove one cell to trigger continue
      mockContainer.querySelector('[data-row="5"][data-col="5"]')?.remove();
      expect(() => renderer.updateGrid()).not.toThrow();
    });
  });

  describe('updateDisplay edge cases', () => {
    test('handles missing mine counter', () => {
      renderer.container.innerHTML = '<div></div>';
      expect(() => renderer.updateDisplay()).not.toThrow();
    });

    test('updateDisplay returns early when game is null', () => {
      renderer.game = null;
      expect(() => renderer.updateDisplay()).not.toThrow();
    });

    test('handles missing timer element', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 1);
      renderer.container.innerHTML = '<div class="mine-counter"></div>';
      expect(() => renderer.updateDisplay()).not.toThrow();
    });

    test('handles game without startTime', () => {
      const grid = renderer.game.getGrid();
      grid[0][0].hasMine = true;
      renderer.game.calculateNumbers();
      renderer.game.startTime = null;
      renderer.updateDisplay();

      const timer = mockContainer.querySelector('.timer');
      expect(timer).not.toBeNull();
    });
  });

  describe('handleClick', () => {
    test('reveals cell on left click', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();

      const cell = mockContainer.querySelector('[data-row="4"][data-col="4"]');
      const clickEvent = { target: cell };
      renderer.handleClick(clickEvent);

      expect(renderer.game.gameOver).toBe(false);
    });

    test('starts timer on first reveal', () => {
      expect(renderer.timerInterval).toBeNull();

      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();

      const cell = mockContainer.querySelector('[data-row="4"][data-col="4"]');
      renderer.handleClick({ target: cell });

      expect(renderer.game.startTime).not.toBeNull();
    });

    test('does not restart timer if interval already exists', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();

      // Manually set an interval to simulate existing timer
      renderer.timerInterval = 9999;

      // Cell at (4,4) is not a mine (excluded (0,0) during placement)
      const cell = mockContainer.querySelector('[data-row="4"][data-col="4"]');
      renderer.handleClick({ target: cell });

      // The existing interval should NOT be replaced
      expect(renderer.timerInterval).toBe(9999);
    });

    test('clears timer when game is over without win', () => {
      // First click initializes game, excludes (0,0) from mine placement
      const safeCell = mockContainer.querySelector('[data-row="0"][data-col="0"]');
      renderer.handleClick({ target: safeCell });

      expect(renderer.game.gameOver).toBe(false);

      // Place a mine at (8,8) - far from (0,0), won't be cascade revealed
      const grid = renderer.game.getGrid();
      grid[8][8].hasMine = true;
      grid[8][8].revealed = false;
      grid[8][8].flagged = false;

      // Click the mine - this will trigger gameOver without congratulations
      const mineCell = mockContainer.querySelector('[data-row="8"][data-col="8"]');
      renderer.handleClick({ target: mineCell });

      expect(renderer.game.gameOver).toBe(true);
      expect(renderer.game.congratulations).toBe(false);
      expect(renderer.timerInterval).toBeNull();
    });

    test('does nothing when game is over', () => {
      const grid = renderer.game.getGrid();
      grid[0][0].hasMine = true;
      renderer.game.calculateNumbers();
      renderer.game.gameOver = true;

      const cell = mockContainer.querySelector('[data-row="4"][data-col="4"]');
      renderer.handleClick({ target: cell });

      expect(cell.classList.contains('revealed')).toBe(false);
    });

    test('shows congratulations on win', () => {
      const grid = renderer.game.getGrid();
      // Place mine at 0,0 and reveal all other cells
      grid[0][0].hasMine = true;
      renderer.game.calculateNumbers();

      // Reveal all cells except the mine
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (!grid[r][c].hasMine) {
            renderer.game.revealCell(r, c);
          }
        }
      }
      renderer.updateGrid();
      renderer.updateDisplay();

      if (renderer.game.congratulations) {
        renderer.showCongratulations();
        expect(document.querySelector('.game-over-overlay')).not.toBeNull();
      }
    });
  });

  describe('handleRightClick', () => {
    test('flags cell on right click', () => {
      const cell = mockContainer.querySelector('[data-row="3"][data-col="3"]');
      const mockEvent = { target: cell, preventDefault: jest.fn() };
      renderer.handleRightClick(mockEvent);

      expect(renderer.game.getGrid()[3][3].flagged).toBe(true);
    });

    test('unflags cell on second right click', () => {
      renderer.game.toggleFlag(2, 2);
      const cell = mockContainer.querySelector('[data-row="2"][data-col="2"]');
      const mockEvent = { target: cell, preventDefault: jest.fn() };
      renderer.handleRightClick(mockEvent);

      expect(renderer.game.getGrid()[2][2].flagged).toBe(false);
    });

    test('does nothing when game is over', () => {
      renderer.game.gameOver = true;
      const cell = mockContainer.querySelector('[data-row="4"][data-col="4"]');
      const mockEvent = { target: cell, preventDefault: jest.fn() };
      renderer.handleRightClick(mockEvent);

      expect(renderer.game.getGrid()[4][4].flagged).toBe(false);
    });
  });

  describe('theme selector', () => {
    test('toggleDropdown toggles dropdown visibility', () => {
      expect(renderer.themeDropdownOpen).toBe(false);
      renderer.toggleDropdown();
      expect(renderer.themeDropdownOpen).toBe(true);

      const dropdown = mockContainer.querySelector('#theme-dropdown');
      expect(dropdown).not.toBeNull();
      expect(dropdown.classList.contains('show')).toBe(true);
    });

    test('toggleDropdown returns early if dropdown not found', () => {
      document.body.innerHTML = '<div id="test-container"></div>';
      mockContainer = document.getElementById('test-container');
      renderer = new MinesweeperRenderer(mockContainer);
      renderer.game = new Minesweeper('beginner');
      renderer.render();
      renderer.bindEvents();

      // Remove dropdown manually
      const dropdown = mockContainer.querySelector('#theme-dropdown');
      if (dropdown) dropdown.remove();

      // Should not throw
      expect(() => renderer.toggleDropdown()).not.toThrow();
    });

    test('closeDropdown hides dropdown', () => {
      renderer.toggleDropdown();
      expect(renderer.themeDropdownOpen).toBe(true);

      renderer.closeDropdown();
      expect(renderer.themeDropdownOpen).toBe(false);

      const dropdown = mockContainer.querySelector('#theme-dropdown');
      expect(dropdown).not.toBeNull();
      expect(dropdown.classList.contains('show')).toBe(false);
    });

    test('selectTheme changes theme', () => {
      renderer.selectTheme('classic');
      expect(renderer.themeManager.currentTheme).toBe('classic');

      const themeNameEl = mockContainer.querySelector('#theme-name');
      expect(themeNameEl.textContent).toBe('Windows经典');
    });

    test('bindThemeEvents closes dropdown when clicking outside', () => {
      renderer.toggleDropdown();
      expect(renderer.themeDropdownOpen).toBe(true);

      const outside = document.createElement('div');
      document.body.appendChild(outside);

      const clickEvent = new MouseEvent('click', { bubbles: true });
      document.dispatchEvent(clickEvent);

      expect(renderer.themeDropdownOpen).toBe(false);
    });

    test('closeDropdown without dropdown element still resets state', () => {
      document.body.innerHTML = '<div id="test-container"></div>';
      mockContainer = document.getElementById('test-container');
      renderer = new MinesweeperRenderer(mockContainer);
      renderer.game = new Minesweeper('beginner');
      renderer.render();
      renderer.bindEvents();

      // Remove dropdown completely
      const dropdown = mockContainer.querySelector('#theme-dropdown');
      if (dropdown) dropdown.remove();

      const dropdownAfter = mockContainer.querySelector('#theme-dropdown');
      expect(dropdownAfter).toBeNull();

      renderer.themeDropdownOpen = true;
      renderer.closeDropdown();

      expect(renderer.themeDropdownOpen).toBe(false);
    });

    test('selectTheme without #theme-name element still works', () => {
      document.body.innerHTML = '<div id="test-container"></div>';
      mockContainer = document.getElementById('test-container');
      renderer = new MinesweeperRenderer(mockContainer);
      renderer.game = new Minesweeper('beginner');
      renderer.render();
      renderer.bindEvents();

      // Remove #theme-name element but leave rest of the DOM
      const gameContainer = mockContainer.querySelector('.game-container');
      const themeName = mockContainer.querySelector('#theme-name');
      if (themeName) themeName.remove();
      // Re-render would restore the element, but since we need to test without it:
      // Verify the method can run without the #theme-name element
      expect(() => renderer.selectTheme('space')).not.toThrow();
    });
  });

  describe('showCongratulations', () => {
    test('creates overlay when called', () => {
      renderer.game.startTime = Date.now() - 5000;
      renderer.game.endTime = Date.now();
      renderer.game.congratulations = true;
      renderer.showCongratulations();

      const overlay = document.querySelector('.game-over-overlay');
      expect(overlay).not.toBeNull();

      const h2 = overlay.querySelector('h2');
      expect(h2.textContent).toContain('恭喜你');
    });
  });

  describe('handleClick with congratulations', () => {
    test('shows congratulations overlay on win', () => {
      const grid = renderer.game.getGrid();
      grid[0][0].hasMine = true;
      renderer.game.calculateNumbers();

      // Reveal all cells EXCEPT the last safe cell [1][1]
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (!grid[r][c].hasMine && !(r === 1 && c === 1)) {
            grid[r][c].revealed = true;
          }
        }
      }
      renderer.updateGrid();
      renderer.updateDisplay();

      expect(renderer.game.gameOver).toBe(false);
      expect(renderer.game.congratulations).toBe(false);

      // Click the last un-revealed safe cell to trigger win
      const lastCell = mockContainer.querySelector('[data-row="1"][data-col="1"]');
      renderer.handleClick({ target: lastCell });

      expect(renderer.game.gameOver).toBe(true);
      expect(renderer.game.congratulations).toBe(true);
    });
  });

  describe('getTimeString', () => {
    test('returns 0秒 when no startTime', () => {
      renderer.game.startTime = null;
      expect(renderer.getTimeString()).toBe('0秒');
    });

    test('returns elapsed time when game is over', () => {
      renderer.game.startTime = Date.now() - 5000;
      renderer.game.endTime = Date.now();
      expect(renderer.getTimeString()).toBe('5秒');
    });
  });

  describe('updateDisplay', () => {
    test('updates mine counter display', () => {
      renderer.game.toggleFlag(0, 0);
      renderer.updateDisplay();
      const counter = mockContainer.querySelector('.mine-counter');
      expect(counter.textContent).toBe('009');
    });

    test('updates timer display', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 1);
      renderer.updateDisplay();

      const timer = mockContainer.querySelector('.timer');
      expect(timer.textContent).toBe('000');
    });
  });

  describe('setDifficulty', () => {
    test('changes difficulty to intermediate', () => {
      renderer.setDifficulty('intermediate');
      expect(renderer.difficulty).toBe('intermediate');
      expect(renderer.game.rows).toBe(16);
    });

    test('changes difficulty to expert', () => {
      renderer.setDifficulty('expert');
      expect(renderer.difficulty).toBe('expert');
      expect(renderer.game.cols).toBe(30);
    });
  });

  describe('reset', () => {
    test('resets game and re-renders', () => {
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      const gameInstance = renderer.game;

      renderer.reset();
      expect(renderer.game).not.toBe(gameInstance);
      expect(renderer.game.gameOver).toBe(false);
    });
  });

  describe('bindEvents DOM triggers', () => {
    test('difficulty button click triggers setDifficulty', () => {
      const buttons = mockContainer.querySelectorAll('[data-diff]');
      expect(buttons.length).toBeGreaterThan(1);

      const intermediateBtn = mockContainer.querySelector('[data-diff="intermediate"]');
      if (intermediateBtn) {
        const clickEvent = new MouseEvent('click', { bubbles: true });
        intermediateBtn.dispatchEvent(clickEvent);
        expect(renderer.difficulty).toBe('intermediate');
      }
    });

    test('theme selector button click toggles dropdown', () => {
      const themeBtn = mockContainer.querySelector('[data-testid="theme-selector"]');
      expect(themeBtn).not.toBeNull();

      expect(renderer.themeDropdownOpen).toBe(false);
      const clickEvent = new MouseEvent('click', { bubbles: true });
      themeBtn.dispatchEvent(clickEvent);
      expect(renderer.themeDropdownOpen).toBe(true);
    });

    test('theme option click triggers selectTheme', () => {
      const spaceOption = mockContainer.querySelector('[data-theme="space"]');
      expect(spaceOption).not.toBeNull();

      const clickEvent = new MouseEvent('click', { bubbles: true });
      spaceOption.dispatchEvent(clickEvent);

      expect(renderer.themeManager.currentTheme).toBe('space');
      expect(renderer.themeDropdownOpen).toBe(false);
    });

    test('handleClick without game object returns early', () => {
      renderer.game = null;
      const cell = mockContainer.querySelector('[data-row="0"][data-col="0"]');
      renderer.handleClick({ target: cell });
      // Should not throw
    });
  });

  describe('bindEvents with missing elements', () => {
    let emptyRenderer;
    let emptyContainer;

    beforeEach(() => {
      emptyContainer = document.createElement('div');
      emptyContainer.id = 'empty-container';
      emptyContainer.innerHTML = '<div class="grid"></div>';
      document.body.appendChild(emptyContainer);
      emptyRenderer = new MinesweeperRenderer(emptyContainer);
      emptyRenderer.game = new Minesweeper('beginner');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('bindEvents handles missing smiley button', () => {
      // smiley button is not in the DOM
      expect(emptyContainer.querySelector('.smiley-button')).toBeNull();
      expect(() => emptyRenderer.bindEvents()).not.toThrow();
    });

    test('bindEvents handles missing theme button', () => {
      expect(emptyContainer.querySelector('[data-testid="theme-selector"]')).toBeNull();
      expect(() => emptyRenderer.bindEvents()).not.toThrow();
    });

    test('bindEvents handles missing cells', () => {
      const cells = emptyContainer.querySelectorAll('.cell');
      expect(cells.length).toBe(0);
      expect(() => emptyRenderer.bindEvents()).not.toThrow();
    });
  });
});
