// Setting play board canvas and its context
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

// Setting next Tetrominoe canvas and its context
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

// Calculate size of canvas from constants.
ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;

ctxNext.canvas.width = 4 * BLOCK_SIZE;
ctxNext.canvas.height = 4 * BLOCK_SIZE;

// Scale blocks
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = new Board(ctx, ctxNext);

board.grid = board.getEmptyBoard();
board.grid.forEach((row, y) => {
   row.forEach((value, x) => {
     if (value == 0) {
         board.drawBlocks(BOARDCOLOR, x, y);
     }
   });
 });

// Starts new game - is exicuted when clicking the id="play-btn" button
function play() {
   ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
   resetGame();
   // board.draw();
   animate();
   SOUNDS.THEME.load();
   SOUNDS.THEME.play();
   SOUNDS.THEME.loop = true;
}

// Resets game parameters as score, lines level, lines untill nex level; creates a new board matrix filled with zeros; resets animation time parameter
function resetGame() {
   account.score = 0;
   account.lines = 0;
   account.level = 0;
   account.nextLevel = 1;
   account.linesNextLevel = 10;
   board.reset();
   time = { start: 0, elapsed: 0, level: 1000 };
 }

// Possible moves - attached to the key-code of the key
const moves = {
   [KEY.LEFT]: p => ({...p, x: p.x - 1}),
   [KEY.RIGHT]: p => ({...p, x: p.x + 1}),
   [KEY.DOWN]: p => ({...p, y: p.y + 1}),
   [KEY.SPACE]: p => ({...p, y: p.y + 1}),
   [KEY.UP]: (p) => board.rotate(p)
}

// Event listener watches the keydown event for the defined keys in the KEY object in constants.js
document.addEventListener('keydown', handleKeyDown);

let time = null;
let blinkTime = null;
let blinkPeriode;
let stopAnimation = false;
let colored = null;

// Game Loop 
function animate(now = 0) {
   // Update elapsed time.  
   time.elapsed = now - time.start;
   // If elapsed time has passed time for current level  
   if (time.elapsed > time.level) {
     // Restart counting from now
      time.start = now;   
      if (!board.drop()) {
         SOUNDS.THEME.loop = false;
         SOUNDS.THEME.pause()
         gameOver();
         return;
      }
      else {
         // Lines were cleared
         if (board.linesCleared){
            // Stopping/ breaking out of current animation loop
            stopAnimation = true; 
            // Reset blinking animation time object
            blinkTime = { start: 0, elapsed: 0, periode: 300};
            blinkCall = 0;
            colored = true;
            // Start blinking animation
            SOUNDS.LINE.play();
            animateRowBlinking();
            // Wait until line gets deleted and animate gets called again - game loop continues
            setTimeout(() => {
               // Reset the linesCleared and stopAnimation
               board.linesCleared = false;
               stopAnimation = false;
               // Draw new canvas
               ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);    
               board.draw();
               SOUNDS.SHIFT.play();   
               animate();
            }, 2500)
         }
      }
   }
   if(!stopAnimation){
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);    
      board.draw();  
      requestId = requestAnimationFrame(animate);
   }
 }


function animateRowBlinking (now) {
   // Update elapsed time.  
   blinkTime.elapsed = now - blinkTime.start;
   // Counting function calls
   blinkCall++;

   if (blinkTime.elapsed > blinkTime.periode) {
      // Restart counting from now
      blinkTime.start = now;   
      if(colored){
         board.yDelete.forEach(y => {
            board.grid[y].forEach((value, x) =>{
               board.drawBlocks(BOARDCOLOR, x, y);
            })
         });
         colored = false;
      } else if(!colored){
         board.yDelete.forEach(y => {
            board.grid[y].forEach((value, x) =>{
               if (value > 0) {
                  board.drawBlocks(COLORS[value - 1], x, y);
               }
            })
         });
         colored = true;
      }
   } 
   // Stopping blinking animtaion when
   if(blinkCall > 120){
      board.yDelete.forEach(y => {
         board.grid[y].forEach((value, x) =>{
            board.drawBlocks(BOARDCOLOR, x, y);
         })
      });
      board.grid.forEach((row, y) => {
         // If every value is greater than zero then we have a full row.
         if (row.every((value) => value > 0)) {
            // Remove the row.
            board.grid.splice(y, 1);
            // Add zero filled row at the top.
            board.grid.unshift(Array(COLS).fill(0));
         }
         });
      return;
   }
   requestAnimationFrame(animateRowBlinking);
}

 let accountValues = {
   score: 0,
   lines: 0,
   level: 0,
   nextLevel: level + 1,
   linesNextLevel: 10,
 }

 function updateAccount(key, value) {
   let element = document.getElementById(key);
   if (element) {
     element.textContent = value;
   }
 }

 let account = new Proxy(accountValues, {
   set: (target, key, value) => {
     target[key] = value;
     updateAccount(key, value);
     return true;
   }
 })

function gameOver() {
   SOUNDS.GAMEOVER.play();
   cancelAnimationFrame(requestId);
   ctx.fillStyle = 'black';
   ctx.fillRect(1, 3, 8, 1.2);
   ctx.font = '1px Arial';
   ctx.fillStyle = 'red';
   ctx.fillText('GAME OVER', 1.8, 4);
 }


 function handleKeyDown (event) {
   if (moves[event.keyCode]){
      // Stop the event from bubbling.
      event.preventDefault();

      // Get new state of piece
      let p = moves[event.keyCode](board.piece);

      // Hard drop
      if(event.keyCode === KEY.SPACE) {
         while(board.valid(p)) {
            account.score += POINTS.HARD_DROP;
            board.piece.move(p);
            p = moves[KEY.DOWN](board.piece);
         }
         // Prevents further movement of the Tetrominoe
         board.hardDrop = true;
         board.freeze();
      }
      // Checking if the move is valid
      if(board.valid(p)){
         //If the move is valid, move the piece.
         board.piece.move(p);
         SOUNDS.MOVE.load();
         SOUNDS.MOVE.play();

         if(event.keyCode === KEY.DOWN){
            account.score += POINTS.SOFT_DROP;
         }
      }
      ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
      board.draw();
   }
}
