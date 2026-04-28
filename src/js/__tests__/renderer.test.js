const MinesweeperRenderer = require('../renderer');

describe('MinesweeperRenderer', () => {
  let renderer;
  let mockContainer;

  beforeEach(() => {
    mockContainer = {
      innerHTML: '',
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };
    renderer = new MinesweeperRenderer(mockContainer);
    renderer.init();
  });

  describe('constructor', () => {
    test('initializes with default difficulty', () => {
      expect(renderer.difficulty).toBe('beginner');
    });

    test('creates Minesweeper game instance', () => {
      expect(renderer.game).not.toBeNull();
    });
  });

  describe('render', () => {
    test('creates game container element', () => {
      renderer.render();
      expect(mockContainer.innerHTML).toContain('game-container');
    });

    test('creates difficulty selector', () => {
      renderer.render();
      expect(mockContainer.innerHTML).toContain('difficulty-selector');
    });

    test('creates mine counter display', () => {
      renderer.render();
      expect(mockContainer.innerHTML).toContain('mine-counter');
    });

    test('creates timer display', () => {
      renderer.render();
      expect(mockContainer.innerHTML).toContain('timer');
    });

    test('creates smiley button', () => {
      renderer.render();
      expect(mockContainer.innerHTML).toContain('smiley-button');
    });

    test('creates grid with correct dimensions', () => {
      renderer.render();
      expect(mockContainer.innerHTML).toContain('data-row');
      expect(mockContainer.innerHTML).toContain('data-col');
    });
  });

  describe('updateGrid', () => {
    test('updates cell revealed state', () => {
      renderer.render();
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 1);
      renderer.updateGrid();
      const cell = mockContainer.querySelector('[data-row="1"][data-col="1"]');
      expect(cell).not.toBeNull();
    });
  });

  describe('updateDisplay', () => {
    test('updates mine counter display', () => {
      renderer.render();
      renderer.game.toggleFlag(0, 0);
      renderer.updateDisplay();
      expect(mockContainer.innerHTML).toContain('9');
    });

    test('updates timer display', () => {
      renderer.render();
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 1);
      renderer.updateDisplay();
      expect(mockContainer.innerHTML).toContain('timer');
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
      renderer.render();
      const gameInstance = renderer.game;
      renderer.game.placeMines(0, 0);
      renderer.game.calculateNumbers();
      renderer.game.revealCell(1, 1);
      renderer.reset();
      expect(renderer.game).not.toBe(gameInstance);
    });
  });
});