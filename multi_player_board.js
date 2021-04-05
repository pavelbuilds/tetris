// Creating a board class with COLS * ROWS cells all set to 0

class Board {

   constructor(ctx, ctxNext) {
      this.ctx = ctx;
      this.ctxNext = ctxNext;
      this.init();
   }
  
   init() {

      // Calculate size of canvas from constants.
      this.ctx.canvas.width = COLS * BLOCK_SIZE_MULTI;
      this.ctx.canvas.height = ROWS * BLOCK_SIZE_MULTI;

      // Scale so we don't need to give size on every draw.
      this.ctx.scale(BLOCK_SIZE_MULTI, BLOCK_SIZE_MULTI);
   }

   // Reset the board when we start the game
   reset() {
      // Creating new play-board matrix filled with zeros
      this.grid = this.getEmptyBoard();
      // Creating new Tetrominoe
      this.piece = new Piece(this.ctx);
      // Set x-coordinate of new Tetrominoe
      this.piece.setStartingPosition();
      // Create new Next-Tetrominoe - showed in the small canvas on the right
      this.getNewPiece();
   }

   // Get board matrix filled with zeros
   getEmptyBoard() {
      return Array.from({length: ROWS},  () => Array(COLS).fill(0));
   }

   // Create new Next-Tetrominoe - showed in the small canvas on the right   
   getNewPiece() {
      const { width, height } = this.ctxNext.canvas;
      this.next = new Piece(this.ctxNext);
      this.ctxNext.clearRect(0, 0, width, height);
      this.next.draw();
   }
   
   // Checking if moving the Tetrominoe is a valid move - checking for if it's inside the play board and if all fields are free
   valid(p) {
      return p.shape.every((row, dy) => {
         return row.every((value, dx) => {
            let x = p.x + dx;
            let y = p.y + dy;
            return value === 0 || (this.isInsideWalls(x,y) && this.notOccupied(x,y));
         });
      });
   }

   // Checks if move to intended field is inside the play board
   isInsideWalls(x,y) {
      return x >= 0 && x < COLS && y <= ROWS;
   }

   // Checks if move to intended field is free
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

      SOUNDS.ROTATE.load();
      SOUNDS.ROTATE.play();
      return p;
   }

   // Attaching the Tetrominoe to the board by increasing the matrix value of its position
   freeze() {
      SOUNDS.LAND.play();
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
      } 
      else {
         // Checks if hardDrop
         if(!this.hardDrop){
            this.freeze();
         }
         // this.linesCleared is monitored by animate() in main.js - if it is true a blinking animation for the rows gets activated
         if(this.clearLines()){
            this.linesCleared = true;
            return true;
         }
         else {
            this.linesCleared = false;
         }
         if (this.piece.y === 0) {
            // Game over
            return false;
         }
         this.piece = this.next;
         this.piece.ctx = this.ctx;
         this.piece.setStartingPosition();
         this.getNewPiece();
         this.hardDrop = false;
      }
      return true;
   }

   clearLines() {
      // Counter for the number of lines that are getting cleared
      this.lines = 0;
      // Y coordinate array for the lines that are cleared
      this.yDelete = [];

      this.grid.forEach((row, y) => {
        // If every value is greater than zero then we have a full row.
        if (row.every((value) => value > 0)) {
            this.lines = this.lines + 1;
            this.yDelete.push(y);
        }
      });
  
      if (this.lines > 0) {
        // Calculate points from cleared lines and level.
        if(this.lines === 4){
           SOUNDS.TETRIS.play();
        }
        //`score_pl${this.id}` syntax picks the score key of the player which the board belongs to - either sore_pl1 or score_pl2 depending on what this.id is set to. Same with lines_pl and level_pl
        this.account[`score_pl${this.id}`] += this.getLinesClearPoints(this.lines) * (this.account[`level_pl${this.id}`] + 1)
        this.account[`lines_pl${this.id}`] += this.lines;
  
        // If we have reached the lines for next level
        if (this.account[`lines_pl${this.id}`] >= LINES_PER_LEVEL) {
          // Goto next level
          SOUNDS.LEVEL.play();
          this.account[`level_pl${this.id}`]++;
  
          // Remove lines so we start working for the next level
          this.account[`lines_pl${this.id}`] -= LINES_PER_LEVEL;
  
          // Increase speed of game
          time[this.id - 1].level = LEVEL[this.account[`level_pl${this.id}`]];
 
        }
      //Return value for drop() method - true if there were any line cleared, otherwise false
      return true;
      }
      return false;
   }

   drawBoard() {
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.drawBlocks(COLORS[value - 1], x, y)
          }
        });
      });
    }

   draw() {
      this.grid.forEach((row, y) => {
         row.forEach((value, x) => {
           if (value == 0) {
               this.drawBlocks(BOARDCOLOR, x, y);
           }
         });
       });

       this.piece.draw();
      this.drawBoard();
    }

   // Return the point value for the number of cleared lines
   getLinesClearPoints(lines) {  
      return lines === 1 ? POINTS.SINGLE :
            lines === 2 ? POINTS.DOUBLE :  
            lines === 3 ? POINTS.TRIPLE :     
            lines === 4 ? POINTS.TETRIS : 
            0;
   }

   drawBlocks(color, x, y) {
         this.ctx.beginPath();
         this.ctx.moveTo(x, y);
         this.ctx.lineTo(x + 1.05, y);
         this.ctx.lineTo(x, y + 1);
         this.ctx.lineTo(x, y);
         this.ctx.fillStyle = color[0];
         this.ctx.fill();

         this.ctx.beginPath();
         this.ctx.moveTo(x + 1,y);
         this.ctx.lineTo(x + 1, y + 1);
         this.ctx.lineTo(x - 0.05, y + 1);
         this.ctx.lineTo(x + 1,y);
         this.ctx.fillStyle = color[1];
         this.ctx.fill();

         this.ctx.fillStyle = color[2];
         this.ctx.fillRect(x + 0.15, y + 0.15, 0.7, 0.7);
   }

}