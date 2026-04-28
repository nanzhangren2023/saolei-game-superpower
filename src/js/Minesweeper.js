class Minesweeper {
  constructor(difficulty = 'beginner') {
    this.difficulty = difficulty;
    this.setDifficulty(difficulty);
    this.gameOver = false;
    this.won = false;
    this.congratulations = false;
    this.startTime = null;
    this.endTime = null;
    this.flaggedCount = 0;
    this.minesPlaced = false;
    this.initGrid();
  }

  setDifficulty(difficulty) {
    const configs = {
      beginner: { rows: 9, cols: 9, mines: 10 },
      intermediate: { rows: 16, cols: 16, mines: 40 },
      expert: { rows: 16, cols: 30, mines: 99 }
    };
    const config = configs[difficulty] || configs.beginner;
    this.rows = config.rows;
    this.cols = config.cols;
    this.mineCount = config.mines;
  }

  initGrid() {
    this.grid = [];
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = {
          revealed: false,
          flagged: false,
          hasMine: false,
          neighborMines: 0
        };
      }
    }
  }

  getGrid() {
    return this.grid;
  }

  placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      if (!this.grid[row][col].hasMine && (row !== excludeRow || col !== excludeCol)) {
        this.grid[row][col].hasMine = true;
        minesPlaced++;
      }
    }
    this.minesPlaced = true;
  }

  calculateNumbers() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col].hasMine) continue;
        this.grid[row][col].neighborMines = this.countNeighborMines(row, col);
      }
    }
  }

  countNeighborMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          if (this.grid[nr][nc].hasMine) count++;
        }
      }
    }
    return count;
  }

  revealCell(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    const cell = this.grid[row][col];
    if (cell.revealed || cell.flagged) return true;

    const isFirstClick = this.startTime === null;
    if (isFirstClick) {
      this.startTime = Date.now();
      this.placeMines(row, col);
      this.calculateNumbers();
      if (cell.hasMine) {
        this.relocateMine(row, col);
      }
    }

    if (cell.hasMine) {
      cell.revealed = true;
      this.gameOver = true;
      this.endTime = Date.now();
      return false;
    }

    cell.revealed = true;

    if (cell.neighborMines === 0) {
      this.cascadeReveal(row, col);
    }

    if (this.checkWin()) {
      this.won = true;
      this.congratulations = true;
      this.gameOver = true;
      this.endTime = Date.now();
      this.autoFlag();
    } else if (this.gameOver && this.endTime === null) {
      this.endTime = Date.now();
    }

    return true;
  }

  cascadeReveal(row, col) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          const neighbor = this.grid[nr][nc];
          if (!neighbor.revealed && !neighbor.flagged && !neighbor.hasMine) {
            neighbor.revealed = true;
            if (neighbor.neighborMines === 0) {
              this.cascadeReveal(nr, nc);
            }
          }
        }
      }
    }
  }

  relocateMine(excludeRow, excludeCol) {
    this.grid[excludeRow][excludeCol].hasMine = false;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (row !== excludeRow || col !== excludeCol) {
          if (!this.grid[row][col].hasMine) {
            this.grid[row][col].hasMine = true;
            this.calculateNumbers();
            return;
          }
        }
      }
    }
  }

  checkWin() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.grid[row][col].hasMine && !this.grid[row][col].revealed) {
          return false;
        }
      }
    }
    return true;
  }

  isWon() {
    return this.won;
  }

  toggleFlag(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;
    const cell = this.grid[row][col];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    this.flaggedCount += cell.flagged ? 1 : -1;
  }

  getMineCounter() {
    return this.mineCount - this.flaggedCount;
  }

  autoFlag() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col].hasMine && !this.grid[row][col].flagged) {
          this.grid[row][col].flagged = true;
        }
      }
    }
    this.flaggedCount = this.mineCount;
  }
}

module.exports = Minesweeper;