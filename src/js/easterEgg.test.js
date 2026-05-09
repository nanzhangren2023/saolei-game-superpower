const Minesweeper = require('./Minesweeper');

describe('Easter Egg - Congratulations', () => {
  test('shows congratulations when player wins', () => {
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

    expect(game.won).toBe(true);
    expect(game.congratulations).toBe(true);
  });

  test('congratulations is false before winning', () => {
    const game = new Minesweeper('beginner');
    expect(game.congratulations).toBe(false);
  });
});