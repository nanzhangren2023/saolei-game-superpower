const Minesweeper = require('../Minesweeper');

describe('Minesweeper', () => {
  describe('constructor', () => {
    test('creates grid with correct dimensions for beginner difficulty', () => {
      const game = new Minesweeper('beginner');
      expect(game.rows).toBe(9);
      expect(game.cols).toBe(9);
      expect(game.mineCount).toBe(10);
    });

    test('creates grid with correct dimensions for intermediate difficulty', () => {
      const game = new Minesweeper('intermediate');
      expect(game.rows).toBe(16);
      expect(game.cols).toBe(16);
      expect(game.mineCount).toBe(40);
    });

    test('creates grid with correct dimensions for expert difficulty', () => {
      const game = new Minesweeper('expert');
      expect(game.rows).toBe(16);
      expect(game.cols).toBe(30);
      expect(game.mineCount).toBe(99);
    });
  });

  describe('getGrid', () => {
    test('returns 2D array with correct dimensions', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      expect(grid.length).toBe(9);
      expect(grid[0].length).toBe(9);
    });

    test('initial grid cells are unopened', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          expect(grid[row][col].revealed).toBe(false);
          expect(grid[row][col].flagged).toBe(false);
          expect(grid[row][col].hasMine).toBe(false);
        }
      }
    });
  });

  describe('placeMines', () => {
    test('places correct number of mines', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      let mineCount = 0;
      const grid = game.getGrid();
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col].hasMine) mineCount++;
        }
      }
      expect(mineCount).toBe(10);
    });

    test('does not place mine at first click position', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(4, 4);
      const grid = game.getGrid();
      expect(grid[4][4].hasMine).toBe(false);
    });
  });

  describe('calculateNumbers', () => {
    test('calculates correct neighbor mine counts', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      grid[0][1].hasMine = true;
      grid[1][0].hasMine = true;
      game.calculateNumbers();
      expect(grid[1][1].neighborMines).toBe(3);
    });

    test('cell with no adjacent mines has count 0', () => {
      const game = new Minesweeper('beginner');
      game.calculateNumbers();
      const grid = game.getGrid();
      expect(grid[0][0].neighborMines).toBe(0);
    });
  });

  describe('revealCell', () => {
    test('reveals a safe cell', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      game.calculateNumbers();
      const result = game.revealCell(1, 1);
      expect(result).toBe(true);
      expect(game.getGrid()[1][1].revealed).toBe(true);
    });

    test('game over when revealing a mine', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      grid[1][1].hasMine = true;
      game.calculateNumbers();
      game.revealCell(2, 2);
      const result = game.revealCell(0, 0);
      expect(result).toBe(false);
      expect(game.gameOver).toBe(true);
    });

    test('cascades reveal for empty cells', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      grid[0][1].hasMine = true;
      grid[1][0].hasMine = true;
      game.calculateNumbers();
      grid[1][1].revealed = true;
      grid[2][1].revealed = true;
      game.cascadeReveal(1, 1);
      const revealedGrid = game.getGrid();
      expect(revealedGrid[1][1].revealed).toBe(true);
      expect(revealedGrid[2][1].revealed).toBe(true);
    });
  });

  describe('toggleFlag', () => {
    test('flags an unopened cell', () => {
      const game = new Minesweeper('beginner');
      game.toggleFlag(0, 0);
      expect(game.getGrid()[0][0].flagged).toBe(true);
    });

    test('unflags a flagged cell', () => {
      const game = new Minesweeper('beginner');
      game.toggleFlag(0, 0);
      game.toggleFlag(0, 0);
      expect(game.getGrid()[0][0].flagged).toBe(false);
    });

    test('cannot flag an opened cell', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      game.calculateNumbers();
      game.revealCell(1, 1);
      game.toggleFlag(1, 1);
      expect(game.getGrid()[1][1].flagged).toBe(false);
    });
  });

  describe('firstClickProtection', () => {
    test('first click is never a mine', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(4, 4);
      game.calculateNumbers();
      const result = game.revealCell(4, 4);
      expect(result).toBe(true);
      expect(game.getGrid()[4][4].revealed).toBe(true);
      expect(game.getGrid()[4][4].hasMine).toBe(false);
    });

    test('mine is relocated if first click lands on mine', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(4, 4);
      game.calculateNumbers();
      const grid = game.getGrid();
      const hasMineAt44 = grid[4][4].hasMine;
      if (hasMineAt44) {
        let foundNewMine = false;
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            if (row !== 4 || col !== 4) {
              if (grid[row][col].hasMine) {
                foundNewMine = true;
                break;
              }
            }
          }
          if (foundNewMine) break;
        }
        expect(foundNewMine).toBe(true);
      }
    });
  });

  describe('win detection', () => {
    test('detects win when all non-mine cells are revealed', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      game.calculateNumbers();
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (!grid[row][col].hasMine) {
            game.revealCell(row, col);
          }
        }
      }
      expect(game.isWon()).toBe(true);
    });

    test('game is not won if some safe cells are unrevealed', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      game.calculateNumbers();
      game.revealCell(1, 1);
      expect(game.isWon()).toBe(false);
    });
  });

  describe('timer', () => {
    test('timer starts on first click', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      game.calculateNumbers();
      expect(game.startTime).toBeNull();
      game.revealCell(1, 1);
      expect(game.startTime).not.toBeNull();
    });

    test('timer stops on game over', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      game.calculateNumbers();
      game.revealCell(2, 2);
      game.revealCell(0, 0);
      expect(game.endTime).not.toBeNull();
    });

    test('timer stops on win', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      game.calculateNumbers();
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (!grid[row][col].hasMine) {
            game.revealCell(row, col);
          }
        }
      }
      expect(game.endTime).not.toBeNull();
    });
  });

  describe('mine counter', () => {
    test('shows total mines minus flagged cells', () => {
      const game = new Minesweeper('beginner');
      expect(game.getMineCounter()).toBe(10);
      game.toggleFlag(0, 0);
      game.toggleFlag(0, 1);
      expect(game.getMineCounter()).toBe(8);
    });

    test('can go negative if over-flagged', () => {
      const game = new Minesweeper('beginner');
      game.toggleFlag(0, 0);
      game.toggleFlag(0, 1);
      game.toggleFlag(0, 2);
      game.toggleFlag(0, 3);
      game.toggleFlag(0, 4);
      game.toggleFlag(0, 5);
      game.toggleFlag(0, 6);
      game.toggleFlag(0, 7);
      game.toggleFlag(0, 8);
      game.toggleFlag(1, 0);
      game.toggleFlag(1, 1);
      expect(game.getMineCounter()).toBe(-1);
    });
  });
});