// Creating a board class with COLS * ROWS cells all set to 0

class Board {

   constructor(ctx, ctxNext) {
      this.ctx = ctx;
      this.ctxNext = ctxNext;
      this.init();
   }
  
   init() {
   // Calculate size of canvas from constants.
   this.ctx.canvas.width = COLS * BLOCK_SIZE;
   this.ctx.canvas.height = ROWS * BLOCK_SIZE;

   // Scale so we don't need to give size on every draw.
   this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
   }

   // Reset the board when we start the game
   reset() {
      this.grid = this.getEmptyBoard();
      this.piece = new Piece(this.ctx);
      this.piece.setStartingPosition();
      this.getNewPiece();
   }

   // Get board matrix fillex with zeros
   getEmptyBoard() {
      return Array.from({length: ROWS},  () => Array(COLS).fill(0));
   }
   
   valid(p) {
      return p.shape.every((row, dy) => {
         return row.every((value, dx) => {
            let x = p.x + dx;
            let y = p.y + dy;
            return value === 0 || (this.isInsideWalls(x,y) && this.notOccupied(x,y));
         });
      });
   }

   // Comment to myself - x >= 0 might be unecessary 
   isInsideWalls(x,y) {
      return x >= 0 && x < COLS && y <= ROWS;
   }

   // Do not really understand why this.grid[y]
   notOccupied(x,y) {
      return this.grid[y] && this.grid[y][x] === 0;
   }

   rotate(piece) {
      // Clone with JSON for immutability.
      let p = JSON.parse(JSON.stringify(piece));
      // Transpose matrix
         for (let y = 0; y < p.shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
            [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
            }
         }
      p.shape.forEach(row => row.reverse());
      return p;
   }

   freeze() {
   this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
         if (value > 0) {
         this.grid[y + this.piece.y][x + this.piece.x] = value;
         }
      });
   });
   }

   drop() {
      let p = moves[KEY.DOWN](this.piece);
      if (this.valid(p)) {
         this.piece.move(p);
      } else {
         this.freeze();
         this.clearLines();
         if (this.piece.y === 0) {
            // Game over
            return false;
         }
         this.piece = this.next;
         this.piece.ctx = this.ctx;
         this.piece.setStartingPosition();
         this.getNewPiece();
      }
      return true;
   }

   drawBoard() {
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = COLORS[value - 1];
            this.ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    }

    draw() {
      this.piece.draw();
      this.drawBoard();
    }

    clearLines() {
      let lines = 0;
      this.grid.forEach((row, y) => {
        // If every value is greater than zero then we have a full row.
        if (row.every((value) => value > 0)) {
          lines++;

          // Remove the row.
          this.grid.splice(y, 1);
  
          // Add zero filled row at the top.
          this.grid.unshift(Array(COLS).fill(0));
        }
      });
  
      if (lines > 0) {
        // Calculate points from cleared lines and level.
  
        account.score += this.getLinesClearPoints(lines) * (account.level + 1)
        account.lines += lines;
        account.linesNextLevel -= lines;
  
        // If we have reached the lines for next level
        if (account.lines >= LINES_PER_LEVEL) {
          // Goto next level
          account.level++;
          account.nextLevel++;
  
          // Remove lines so we start working for the next level
          account.lines -= LINES_PER_LEVEL;
          account.linesNextLevel = 10;
  
          // Increase speed of game
          time.level = LEVEL[account.level];
        }
      }
   }

   blinkingLines(y) {
         this.ctx.fillStyle = "#FF0000";
         this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
         console.log("worked");
         // console.log(y);
         // setTimeout(() => {
         //    this.grid[y].forEach((value, x) => {
         //       this.ctx.fillStyle = "#FF0000";
         //       this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
         //             });
         // },600);
         // setTimeout(() => {
         //    this.ctx.fillStyle = "#FF0000";
         //    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
         //       },1200);
         // setTimeout(() => {
         //    this.grid[y].forEach((value, x) => {
         //       this.ctx.fillStyle = "#FF0000";
         //       this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
         //    });
         // },1800);
            // Remove the row.
            this.grid.splice(y, 1);
            // Add zero filled row at the top.
            this.grid.unshift(Array(COLS).fill(0));

      // this.grid.forEach((row, y) => {
      //    row.forEach((value, x) => {
      //      if (value > 0) {
      //        this.ctx.fillStyle = COLORS[value - 1];
      //        this.ctx.fillRect(x, y, 1, 1);
      //      }
      //    });
      //  });
   } 

   getLinesClearPoints(lines) {  
      return lines === 1 ? POINTS.SINGLE :
            lines === 2 ? POINTS.DOUBLE :  
            lines === 3 ? POINTS.TRIPLE :     
            lines === 4 ? POINTS.TETRIS : 
            0;
   }

   getNewPiece() {
      const { width, height } = this.ctxNext.canvas;
      this.next = new Piece(this.ctxNext);
      this.ctxNext.clearRect(0, 0, width, height);
      this.next.draw();
    }
}