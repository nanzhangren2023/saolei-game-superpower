const ThemeManager = require('./theme-manager');

describe('ThemeManager', () => {
  let themeManager;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    themeManager = new ThemeManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('initializes with default theme "dark" when no stored preference', () => {
      expect(themeManager.currentTheme).toBe('dark');
    });

    test('loads stored theme from localStorage if available', () => {
      localStorage.setItem('minesweeper-theme', 'classic');
      themeManager = new ThemeManager();
      expect(themeManager.currentTheme).toBe('classic');
    });

    test('loads default theme when stored theme is invalid', () => {
      localStorage.setItem('minesweeper-theme', 'nonexistent');
      themeManager = new ThemeManager();
      expect(themeManager.currentTheme).toBe('dark');
    });
  });

  describe('getAllThemes', () => {
    test('returns 5 themes', () => {
      const themes = themeManager.getAllThemes();
      const keys = Object.keys(themes);
      expect(keys.length).toBe(5);
      expect(keys).toContain('dark');
      expect(keys).toContain('classic');
      expect(keys).toContain('space');
      expect(keys).toContain('ocean');
      expect(keys).toContain('candy');
    });
  });

  describe('getCurrentTheme', () => {
    test('returns current theme object', () => {
      themeManager.apply('space');
      const theme = themeManager.getCurrentTheme();
      expect(theme.name).toBe('太空探险');
      expect(theme.className).toBe('theme-space');
    });

    test('returns theme with icons', () => {
      themeManager.apply('candy');
      const theme = themeManager.getCurrentTheme();
      expect(theme.icons.mine).toBe('💖');
      expect(theme.icons.flag).toBe('🎀');
    });
  });

  describe('apply', () => {
    test('apply dark theme sets class on document', () => {
      themeManager.apply('dark');
      expect(document.documentElement.className).toBe('theme-dark');
      expect(themeManager.currentTheme).toBe('dark');
    });

    test('apply classic theme sets class on document', () => {
      themeManager.apply('classic');
      expect(document.documentElement.className).toBe('theme-classic');
      expect(themeManager.currentTheme).toBe('classic');
    });

    test('apply space theme sets class on document', () => {
      themeManager.apply('space');
      expect(document.documentElement.className).toBe('theme-space');
      expect(themeManager.currentTheme).toBe('space');
    });

    test('apply ocean theme sets class on document', () => {
      themeManager.apply('ocean');
      expect(document.documentElement.className).toBe('theme-ocean');
      expect(themeManager.currentTheme).toBe('ocean');
    });

    test('apply candy theme sets class on document', () => {
      themeManager.apply('candy');
      expect(document.documentElement.className).toBe('theme-candy');
      expect(themeManager.currentTheme).toBe('candy');
    });

    test('persist theme to localStorage', () => {
      themeManager.apply('space');
      expect(localStorage.getItem('minesweeper-theme')).toBe('space');
    });

    test('dispatches themechange event', () => {
      let eventFired = false;
      document.addEventListener('themechange', (e) => {
        eventFired = true;
      });
      themeManager.apply('classic');
      expect(eventFired).toBe(true);
    });
  });

  describe('invalid theme handling', () => {
    test('apply non-existent theme key does nothing', () => {
      themeManager.apply('nonexistent');
      expect(document.documentElement.className).toBe('');
    });

    test('apply empty string does nothing', () => {
      themeManager.apply('');
      expect(document.documentElement.className).toBe('');
    });
  });

  describe('saveTheme and loadTheme', () => {
    test('saveTheme stores key in localStorage', () => {
      themeManager.saveTheme('classic');
      expect(localStorage.getItem('minesweeper-theme')).toBe('classic');
    });

    test('loadTheme returns stored theme', () => {
      localStorage.setItem('minesweeper-theme', 'ocean');
      expect(themeManager.loadTheme()).toBe('ocean');
    });

    test('loadTheme returns dark when nothing stored', () => {
      expect(themeManager.loadTheme()).toBe('dark');
    });

    test('loadTheme returns dark for invalid stored value', () => {
      localStorage.setItem('minesweeper-theme', 'invalid');
      expect(themeManager.loadTheme()).toBe('dark');
    });

    test('saveTheme silently fails when localStorage throws', () => {
      const originalSet = localStorage.setItem;
      localStorage.setItem = jest.fn(() => { throw new Error('quota exceeded'); });
      // Should not throw
      expect(() => themeManager.saveTheme('dark')).not.toThrow();
      localStorage.setItem = originalSet;
    });

    test('loadTheme returns default when localStorage throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage blocked');
      });

      const freshManager = new ThemeManager();
      expect(freshManager.currentTheme).toBe('dark');

      jest.restoreAllMocks();
    });

    test('loadTheme method catches exception separately', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage blocked');
      });

      const result = themeManager.loadTheme();
      expect(result).toBe('dark');

      jest.restoreAllMocks();
    });
  });

  describe('getThemeIcon', () => {
    test('returns correct mine icon for dark theme', () => {
      themeManager.apply('dark');
      expect(themeManager.getThemeIcon('mine')).toBe('💣');
    });

    test('returns correct flag icon for classic theme', () => {
      themeManager.apply('classic');
      expect(themeManager.getThemeIcon('flag')).toBe('🚩');
    });

    test('returns space theme mine icon', () => {
      themeManager.apply('space');
      expect(themeManager.getThemeIcon('mine')).toBe('🌑');
    });

    test('returns ocean theme mine icon', () => {
      themeManager.apply('ocean');
      expect(themeManager.getThemeIcon('mine')).toBe('⚓');
    });

    test('returns candy theme mine icon', () => {
      themeManager.apply('candy');
      expect(themeManager.getThemeIcon('mine')).toBe('💖');
    });

    test('returns smiley win icon', () => {
      themeManager.apply('dark');
      expect(themeManager.getThemeIcon('smiley', 'win')).toBe('😎');
    });

    test('returns smiley lose icon', () => {
      themeManager.apply('dark');
      expect(themeManager.getThemeIcon('smiley', 'lose')).toBe('😵');
    });

    test('returns smiley default icon', () => {
      themeManager.apply('dark');
      expect(themeManager.getThemeIcon('smiley', 'default')).toBe('😊');
    });

    test('returns smiley default for invalid state', () => {
      themeManager.apply('dark');
      expect(themeManager.getThemeIcon('smiley', 'invalidState')).toBe('😊');
    });

    test('returns empty string for unknown icon type', () => {
      themeManager.apply('dark');
      expect(themeManager.getThemeIcon('unknown')).toBe('');
    });
  });

  describe('updateSmiley', () => {
    let mockContainer;

    beforeEach(() => {
      mockContainer = document.createElement('div');
      mockContainer.innerHTML = '<button class="smiley-button"></button>';
    });

    test('shows default smiley when game has not started', () => {
      const mockGame = { won: false, gameOver: false, startTime: null };
      themeManager.apply('dark');
      themeManager.updateSmiley(mockContainer, mockGame);
      expect(mockContainer.querySelector('.smiley-button').textContent).toBe('😊');
    });

    test('shows playing smiley when game is in progress', () => {
      const mockGame = { won: false, gameOver: false, startTime: Date.now() };
      themeManager.apply('dark');
      themeManager.updateSmiley(mockContainer, mockGame);
      expect(mockContainer.querySelector('.smiley-button').textContent).toBe('🤔');
    });

    test('shows win smiley when game is won', () => {
      const mockGame = { won: true, gameOver: true };
      themeManager.apply('dark');
      themeManager.updateSmiley(mockContainer, mockGame);

      expect(mockContainer.querySelector('.smiley-button').textContent).toBe('😎');
    });

    test('shows lose smiley when game is over but not won', () => {
      const mockGame = { won: false, gameOver: true };
      themeManager.apply('dark');
      themeManager.updateSmiley(mockContainer, mockGame);
      expect(mockContainer.querySelector('.smiley-button').textContent).toBe('😵');
    });

    test('shows space theme win smiley', () => {
      const mockGame = { won: true, gameOver: true };
      themeManager.apply('space');
      themeManager.updateSmiley(mockContainer, mockGame);
      expect(mockContainer.querySelector('.smiley-button').textContent).toBe('🤩');
    });

    test('does nothing when smiley button is missing', () => {
      const emptyContainer = document.createElement('div');
      themeManager.updateSmiley(emptyContainer, null);
      expect(emptyContainer.innerHTML).toBe('');
    });
  });

  describe('updateIcons', () => {
    beforeEach(() => {
      themeManager.apply('dark');
    });

    test('updates mine icons in revealed mine cells', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div class="cell mine"></div><div class="cell flagged"></div>';

      themeManager.updateIcons(container, null);

      const mineCell = container.querySelector('.cell.mine');
      expect(mineCell.textContent).toBe('💣');
    });

    test('updates flag icons in flagged cells', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div class="cell flagged"></div><div class="cell flagged"></div>';

      themeManager.updateIcons(container, null);

      const flagCells = container.querySelectorAll('.cell.flagged');
      flagCells.forEach(cell => {
        expect(cell.textContent).toBe('🚩');
      });
    });

    test('updates smiley icon based on game state', () => {
      const container = document.createElement('div');
      container.innerHTML = '<button class="smiley-button"></button>';
      const mockGame = { won: false, gameOver: true, startTime: null };

      themeManager.updateIcons(container, mockGame);

      expect(container.querySelector('.smiley-button').textContent).toBe('😵');
    });
  });
});
