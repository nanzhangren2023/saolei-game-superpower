class ThemeManager {
  constructor() {
    this.themes = {
      dark: {
        name: '深色经典',
        className: 'theme-dark',
        icons: {
          mine: '💣',
          flag: '🚩',
          smiley: { default: '😊', win: '😎', lose: '😵', playing: '🤔' }
        }
      },
      classic: {
        name: 'Windows经典',
        className: 'theme-classic',
        icons: {
          mine: '💣',
          flag: '🚩',
          smiley: { default: '😊', win: '😎', lose: '😵', playing: '🤔' }
        }
      },
      space: {
        name: '太空探险',
        className: 'theme-space',
        icons: {
          mine: '🌑',
          flag: '⭐',
          smiley: { default: '👨‍🚀', win: '🤩', lose: '😴', playing: '🧑‍🚀' }
        }
      },
      ocean: {
        name: '海洋世界',
        className: 'theme-ocean',
        icons: {
          mine: '⚓',
          flag: '🎏',
          smiley: { default: '🤿', win: '🐬', lose: '🐙', playing: '🐠' }
        }
      },
      candy: {
        name: '糖果派对',
        className: 'theme-candy',
        icons: {
          mine: '💖',
          flag: '🎀',
          smiley: { default: '🎀', win: '🎉', lose: '🥺', playing: '🤗' }
        }
      }
    };
    this.currentTheme = this.loadTheme();
  }

  loadTheme() {
    try {
      return localStorage.getItem('minesweeper-theme') || 'dark';
    } catch {
      return 'dark';
    }
  }

  saveTheme(themeKey) {
    try {
      localStorage.setItem('minesweeper-theme', themeKey);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }

  apply(themeKey) {
    const theme = this.themes[themeKey];
    if (!theme) return;

    document.documentElement.className = theme.className;
    this.currentTheme = themeKey;
    this.saveTheme(themeKey);

    this.dispatchChange(theme);
  }

  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }

  getAllThemes() {
    return this.themes;
  }

  dispatchChange(theme) {
    const event = new CustomEvent('themechange', { detail: theme });
    document.dispatchEvent(event);
  }

  getThemeIcon(type, state) {
    const theme = this.getCurrentTheme();
    if (type === 'smiley') {
      return theme.icons.smiley[state] || theme.icons.smiley.default;
    }
    return theme.icons[type] || '';
  }

  updateIcons(container, game) {
    const mineIcon = this.getThemeIcon('mine');
    const flagIcon = this.getThemeIcon('flag');

    container.querySelectorAll('.cell.mine').forEach(cell => {
      cell.textContent = mineIcon;
    });

    container.querySelectorAll('.cell.flagged').forEach(cell => {
      cell.textContent = flagIcon;
    });

    this.updateSmiley(container, game);
  }

  updateSmiley(container, game) {
    const smiley = container.querySelector('.smiley-button');
    if (!smiley) return;

    if (game && game.won) {
      smiley.textContent = this.getThemeIcon('smiley', 'win');
    } else if (game && game.gameOver) {
      smiley.textContent = this.getThemeIcon('smiley', 'lose');
    } else if (game && game.startTime) {
      smiley.textContent = this.getThemeIcon('smiley', 'playing');
    } else {
      smiley.textContent = this.getThemeIcon('smiley', 'default');
    }
  }
}
