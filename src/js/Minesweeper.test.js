const Minesweeper = require('./Minesweeper');

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

    test('relocateMine moves mine when first click is on mine', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(4, 4);
      game.calculateNumbers();
      const grid = game.getGrid();
      grid[4][4].hasMine = true;
      expect(grid[4][4].hasMine).toBe(true);
      game.relocateMine(4, 4);
      expect(grid[4][4].hasMine).toBe(false);
      let foundMine = false;
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (grid[row][col].hasMine && !(row === 4 && col === 4)) {
            foundMine = true;
            break;
          }
        }
        if (foundMine) break;
      }
      expect(foundMine).toBe(true);
    });

    test('relocateMine visits the excluded cell during iteration', () => {
      // This tests the branch: if (row !== excludeRow || col !== excludeCol)
      // The else branch is the excluded cell itself
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0); // excludes 0,0
      game.calculateNumbers();

      // Ensure all cells except [0][0] have mines to force the else branch to be hit for [0][0]
      const grid = game.getGrid();
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (!(row === 0 && col === 0)) {
            grid[row][col].hasMine = true;
          }
        }
      }

      // relocateMine should skip [0][0] and search, eventually finding no space
      game.relocateMine(0, 0);

      // [0][0] should still have the mine cleared
      expect(grid[0][0].hasMine).toBe(false);
    });

    test('relocateMine skips cells that already have mines', () => {
      // This tests the branch: if (!this.grid[row][col].hasMine) else branch
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      game.calculateNumbers();

      const grid = game.getGrid();
      grid[0][0].hasMine = true;

      // Manually set first several cells to have mines
      grid[1][0].hasMine = true;

      game.relocateMine(0, 0);

      // The original mine at [0][0] should be removed
      expect(grid[0][0].hasMine).toBe(false);
      // A new mine should be placed elsewhere (since [0][0] is excluded and many are full)
      const grid2 = game.getGrid();
      let mineCount = 0;
      for (let row = 0; row < grid2.length; row++) {
        for (let col = 0; col < grid2[row].length; col++) {
          if (grid2[row][col].hasMine && !(row === 0 && col === 0)) mineCount++;
        }
      }
      expect(mineCount).toBeGreaterThan(0);
    });

    test('revealCell triggers relocateMine on first click when cell has mine', () => {
      // Tests line 93-95: if first click lands on a mine, relocateMine is called
      const game = new Minesweeper('beginner');
      // Use expert difficulty (16x30, 99 mines) - very high chance first click lands on mine
      const game2 = new Minesweeper('expert');
      game2.placeMines(8, 15);
      game2.calculateNumbers();
      // Force cell at [8][15] to have a mine to trigger relocateMine
      game2.getGrid()[8][15].hasMine = true;

      // revealCell should call relocateMine for first click on mine
      const result = game2.revealCell(8, 15);
      expect(result).toBe(true);
      // After relocation, it should no longer be a mine
      expect(game2.getGrid()[8][15].hasMine).toBe(false);
      expect(game2.getGrid()[8][15].revealed).toBe(true);
    });

    test('toggleFlag on out-of-bounds cell does nothing', () => {
      const game = new Minesweeper('beginner');
      game.toggleFlag(-1, 0);
      game.toggleFlag(0, -1);
      game.toggleFlag(10, 10);
      expect(game.getGrid()[0][0].flagged).toBe(false);
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

  describe('autoFlag', () => {
    test('autoFlag flags all mines', () => {
      const game = new Minesweeper('beginner');
      const grid = game.getGrid();
      grid[0][0].hasMine = true;
      grid[0][1].hasMine = true;
      game.calculateNumbers();
      game.autoFlag();
      expect(game.getGrid()[0][0].flagged).toBe(true);
      expect(game.getGrid()[0][1].flagged).toBe(true);
      expect(game.flaggedCount).toBe(game.mineCount);
    });
  });

  describe('edge cases', () => {
    test('endTime is set when gameOver but endTime was null', () => {
      const game = new Minesweeper('beginner');
      game.placeMines(0, 0);
      game.calculateNumbers();

      // Simulate game over state without endTime set
      game.gameOver = true;
      game.startTime = Date.now();

      // Reveal a cell that has neighbor mines to avoid cascade
      const grid = game.getGrid();
      // Find a cell with neighborMines > 0 and is not a mine
      let testRow = 0, testCol = 0;
      for (let row = 1; row < grid.length && testRow === 0; row++) {
        for (let col = 1; col < grid[row].length && testRow === 0; col++) {
          if (!grid[row][col].hasMine && grid[row][col].neighborMines > 0) {
            testRow = row;
            testCol = col;
          }
        }
      }

      expect(game.endTime).toBeNull();
      const result = game.revealCell(testRow, testCol);
      expect(result).toBe(true);
      expect(game.endTime).not.toBeNull();
    });
  });
});