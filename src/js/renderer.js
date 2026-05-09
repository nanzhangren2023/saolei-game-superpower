if (typeof module !== 'undefined' && module.exports) {
  globalThis.ThemeManager = require('./theme-manager');
}

class MinesweeperRenderer {
  constructor(container) {
    this.container = container;
    this.difficulty = 'beginner';
    this.game = null;
    this.timerInterval = null;
    this.gameInstance = window.Minesweeper;
    this.themeManager = new ThemeManager();
    this.themeDropdownOpen = false;
  }

  init() {
    this.themeManager.apply(this.themeManager.loadTheme());
    this.game = new this.gameInstance(this.difficulty);
    this.render();
    this.bindEvents();
    this.bindThemeEvents();
  }

  render() {
    const { rows, cols } = this.game;
    let gridHTML = '';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        gridHTML += `<div class="cell" data-row="${row}" data-col="${col}"></div>`;
      }
    }

    const currentTheme = this.themeManager.getCurrentTheme();
    const smileyIcon = this.themeManager.getThemeIcon('smiley', 'default');

    this.container.innerHTML = `
      <div class="game-container">
        <div class="game-header">
          <div class="header-top">
            <h1>扫雷</h1>
            <div class="theme-selector">
            <button class="theme-selector-btn" data-testid="theme-selector">
              🎨 <span id="theme-name">${currentTheme.name}</span> ▼
            </button>
            <div class="theme-selector-dropdown" id="theme-dropdown">
              ${Object.entries(this.themeManager.getAllThemes()).map(([key, theme]) =>
                `<div class="theme-option ${this.themeManager.currentTheme === key ? 'active' : ''}" data-theme="${key}">${theme.name}</div>`
              ).join('')}
            </div>
            </div>
          </div>
          <div class="difficulty-selector">
            <button data-diff="beginner" class="${this.difficulty === 'beginner' ? 'active' : ''}">初级</button>
            <button data-diff="intermediate" class="${this.difficulty === 'intermediate' ? 'active' : ''}">中级</button>
            <button data-diff="expert" class="${this.difficulty === 'expert' ? 'active' : ''}">高级</button>
          </div>
        </div>
        <div class="game-panel">
          <div class="mine-counter">${String(this.game.mineCount).padStart(3, '0')}</div>
          <button class="smiley-button" data-testid="smiley-button">${smileyIcon}</button>
          <div class="timer">000</div>
        </div>
        <div class="grid" style="--cols: ${cols};">
          ${gridHTML}
        </div>
      </div>
    `;
  }

  updateGrid() {
    if (!this.game) return;
    const grid = this.game.getGrid();
    const mineIcon = this.themeManager.getThemeIcon('mine');
    const flagIcon = this.themeManager.getThemeIcon('flag');

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) continue;

        const cellData = grid[row][col];
        cell.className = 'cell';
        cell.removeAttribute('data-number');
        cell.textContent = '';

        if (cellData.flagged) {
          cell.classList.add('flagged');
          cell.textContent = flagIcon;
        } else if (cellData.hasMine && this.game.gameOver) {
          cell.classList.add('mine');
          cell.textContent = mineIcon;
        } else if (cellData.revealed) {
          cell.classList.add('revealed');
          if (cellData.neighborMines > 0) {
            cell.textContent = cellData.neighborMines;
            cell.setAttribute('data-number', cellData.neighborMines);
          } else {
            cell.textContent = '';
          }
        }
      }
    }
  }

  updateDisplay() {
    if (!this.game) return;
    const counter = this.container.querySelector('.mine-counter');
    if (counter) {
      counter.textContent = String(this.game.getMineCounter()).padStart(3, '0');
    }

    const timer = this.container.querySelector('.timer');
    if (timer && this.game.startTime) {
      const elapsed = this.game.endTime
        ? Math.floor((this.game.endTime - this.game.startTime) / 1000)
        : Math.floor((Date.now() - this.game.startTime) / 1000);
      timer.textContent = String(Math.min(elapsed, 999)).padStart(3, '0');
    }

    this.themeManager.updateSmiley(this.container, this.game);
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.game = new this.gameInstance(difficulty);
    this.render();
    this.bindEvents();
  }

  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.game = new this.gameInstance(this.difficulty);
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    const cells = this.container.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.addEventListener('click', (e) => this.handleClick(e));
      cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));
    });

    const smiley = this.container.querySelector('.smiley-button');
    if (smiley) {
      smiley.addEventListener('click', () => this.reset());
    }

    const diffButtons = this.container.querySelectorAll('[data-diff]');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setDifficulty(btn.dataset.diff);
      });
    });

    const themeBtn = this.container.querySelector('[data-testid="theme-selector"]');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });
    }

    const themeOptions = this.container.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.selectTheme(option.dataset.theme);
      });
    });
  }

  toggleDropdown() {
    const dropdown = this.container.querySelector('#theme-dropdown');
    if (!dropdown) return;
    this.themeDropdownOpen = !this.themeDropdownOpen;
    dropdown.classList.toggle('show', this.themeDropdownOpen);
  }

  closeDropdown() {
    const dropdown = this.container.querySelector('#theme-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
    this.themeDropdownOpen = false;
  }

  selectTheme(themeKey) {
    this.themeManager.apply(themeKey);
    const themeNameEl = this.container.querySelector('#theme-name');
    if (themeNameEl) {
      themeNameEl.textContent = this.themeManager.getCurrentTheme().name;
    }
    this.updateGrid();
    this.updateDisplay();
    this.closeDropdown();
    this.container.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === themeKey);
    });
  }

  bindThemeEvents() {
    document.addEventListener('click', (e) => {
      const dropdown = this.container.querySelector('#theme-dropdown');
      const themeBtn = this.container.querySelector('[data-testid="theme-selector"]');
      if (this.themeDropdownOpen && dropdown && !dropdown.contains(e.target) && e.target !== themeBtn) {
        this.closeDropdown();
      }
    });
  }

  handleClick(e) {
    if (!this.game || this.game.gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    this.game.revealCell(row, col);
    this.updateGrid();
    this.updateDisplay();

    if (!this.timerInterval && this.game.startTime) {
      this.timerInterval = setInterval(() => this.updateDisplay(), 1000);
    }

    if (this.game.gameOver) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      if (this.game.congratulations) {
        this.showCongratulations();
      }
    }
  }

  showCongratulations() {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
      <div class="game-over-content win">
        <h2>🎉 恭喜你通关！ 🎉</h2>
        <p>用时: ${this.getTimeString()}</p>
        <button class="play-again-btn" onclick="this.closest('.game-over-overlay').remove(); game.reset();">再玩一次</button>
      </div>
    `;
    this.container.appendChild(overlay);
  }

  getTimeString() {
    if (!this.game || !this.game.startTime) return '0秒';
    const elapsed = Math.floor((this.game.endTime - this.game.startTime) / 1000);
    return elapsed + '秒';
  }

  handleRightClick(e) {
    e.preventDefault();
    if (!this.game || this.game.gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    this.game.toggleFlag(row, col);
    this.updateGrid();
    this.updateDisplay();
  }
}

window.MinesweeperRenderer = MinesweeperRenderer;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MinesweeperRenderer;
}
