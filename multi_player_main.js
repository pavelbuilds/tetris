// Player 1 canvas set-up

// Setting play board canvas and its context
const canvas_pl1 = document.getElementById('board_pl1');
const ctx_pl1 = canvas_pl1.getContext('2d');
// Setting next Tetrominoe canvas and its context
const canvasNext_pl1 = document.getElementById('next_pl1');
const ctxNext_pl1 = canvasNext_pl1.getContext('2d');
// Calculate size of canvas from constants.
ctx_pl1.canvas.width = COLS * BLOCK_SIZE_MULTI;
ctx_pl1.canvas.height = ROWS * BLOCK_SIZE_MULTI;
ctxNext_pl1.canvas.width = 4 * BLOCK_SIZE_MULTI;
ctxNext_pl1.canvas.height = 4 * BLOCK_SIZE_MULTI;
// Scale blocks
ctx_pl1.scale(BLOCK_SIZE_MULTI, BLOCK_SIZE_MULTI);
ctxNext_pl1.scale(BLOCK_SIZE_MULTI, BLOCK_SIZE_MULTI);


// Player 2 canvas set-up

// Setting play board canvas and its context
const canvas_pl2 = document.getElementById('board_pl2');
const ctx_pl2 = canvas_pl2.getContext('2d');
// Setting next Tetrominoe canvas and its context
const canvasNext_pl2 = document.getElementById('next_pl2');
const ctxNext_pl2 = canvasNext_pl2.getContext('2d');
// Calculate size of canvas from constants.
ctx_pl2.canvas.width = COLS * BLOCK_SIZE_MULTI;
ctx_pl2.canvas.height = ROWS * BLOCK_SIZE_MULTI;
ctxNext_pl2.canvas.width = 4 * BLOCK_SIZE_MULTI;
ctxNext_pl2.canvas.height = 4 * BLOCK_SIZE_MULTI;
// Scale blocks
ctx_pl2.scale(BLOCK_SIZE_MULTI, BLOCK_SIZE_MULTI);
ctxNext_pl2.scale(BLOCK_SIZE_MULTI, BLOCK_SIZE_MULTI);


let   board_pl1 = new Board(ctx_pl1, ctxNext_pl1),
      board_pl2 = new Board(ctx_pl2, ctxNext_pl2);

let   board = [board_pl1, board_pl2],
      ctx = [ctx_pl1, ctx_pl2];

board[0].grid = board[0].getEmptyBoard();
board[1].grid = board[1].getEmptyBoard();

board[0].id = 1;
board[1].id = 2;

// Empty board gets painted with boxes
board.forEach((board) => {
   board.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value == 0) {
            board.drawBlocks(BOARDCOLOR, x, y);
        }
      });
    });
})

// Starts new game
let playBtn = document.querySelector("#play-btn");

playBtn.addEventListener('click', function () {
   // Reset text inside winners div, in case it's not the first game + stop confetti
   winner_text.innerText = "";
   winner_text.innerText = "";
   confetti.stop();

   // Remove focus from play button, so that space key does not start new game when game over
   this.blur();

   document.addEventListener('keydown', handleKeyDown);

   ctx.forEach((ctx) => {
      ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
   });
   resetGame();

   // Call animate for each player
   animate(0, 0);
   animate(0, 1);

   //Play the theme song in a loop 
   SOUNDS.THEME.load();
   SOUNDS.THEME.play();
   SOUNDS.THEME.loop = true;
})

// Resets game parameters as score, lines level, lines untill nex level; creates a new board matrix filled with zeros; resets animation time parameter
let time = null;
function resetGame() {
   board[0].account.score_pl1 = 0;
   board[0].account.lines_pl1 = 0;
   board[0].account.level_pl1 = 0;
   board[1].account.score_pl2 = 0;
   board[1].account.lines_pl2 = 0;
   board[1].account.level_pl2 = 0;
   board.forEach((board) => {board.reset()});
   time = [{ start: 0, elapsed: 0, level: 1000 }, { start: 0, elapsed: 0, level: 1000 }];
 }

 board[0].accountValues = {
   score_pl1: 0,
   lines_pl1: 0,
   level_pl1: 0
 }

 board[1].accountValues = {
   score_pl2: 0,
   lines_pl2: 0,
   level_pl2: 0
 }

 board[0].account = new Proxy(board[0].accountValues, {
   set: (target, key, value) => {
     target[key] = value;
     updateAccount(key, value);
     return true;
   }
 })

 board[1].account = new Proxy(board[1].accountValues, {
   set: (target, key, value) => {
     target[key] = value;
     updateAccount(key, value);
     return true;
   }
 })

 let accounts = [board[0].account, board[1].account];

 function updateAccount(key, value) {
   let element = document.getElementById(key);
   if (element) {
     element.textContent = value;
   }
 }

// Possible moves - attached to the key-code of the key
const moves = {
   [KEY_MP.LEFT_PL1]: p => ({...p, x: p.x - 1}),
   [KEY_MP.RIGHT_PL1]: p => ({...p, x: p.x + 1}),
   [KEY_MP.DOWN_PL1]: p => ({...p, y: p.y + 1}),
   [KEY_MP.SPACE_PL1]: p => ({...p, y: p.y + 1}),
   [KEY_MP.UP_PL1]: (p) => board[0].rotate(p),
   [KEY_MP.LEFT_PL2]: p => ({...p, x: p.x - 1}),
   [KEY_MP.RIGHT_PL2]: p => ({...p, x: p.x + 1}),
   [KEY_MP.DOWN_PL2]: p => ({...p, y: p.y + 1}),
   [KEY_MP.SPACE_PL2]: p => ({...p, y: p.y + 1}),
   [KEY_MP.UP_PL2]: (p) => board[1].rotate(p)
}

// Event listener function for the defined keys in the KEY object in constants.js
function handleKeyDown (event) {
   if (moves[event.keyCode]){
      // Stop the event from bubbling.
      event.preventDefault();

      let x;
      if(event.keyCode <= 45) {x = 1}
      else {x = 0};
      // Get new state of piece
      let p = moves[event.keyCode](board[x].piece);

      // Hard drop
      if(event.keyCode === KEY_MP.SPACE_PL1 || event.keyCode === KEY_MP.SPACE_PL2) {
         while(board[x].valid(p)) {
            board[x].account[`score_pl${board[x].id}`] += POINTS.HARD_DROP;
            board[x].piece.move(p);
            p = moves[KEY.DOWN](board[x].piece);
         }
         // Prevents further movement of the Tetrominoe
         board[x].hardDrop = true;
         board[x].freeze();
      }
      // Checking if the move is valid
      if(board[x].valid(p)){
         //If the move is valid, move the piece.
         board[x].piece.move(p);
         SOUNDS.MOVE.load();
         SOUNDS.MOVE.play();

         if(event.keyCode === KEY_MP.DOWN_PL1 || event.keyCode === KEY_MP.DOWN_PL2){
            board[x].account[`score_pl${board[x].id}`] += POINTS.SOFT_DROP;
         }
      }
      ctx[x].clearRect(0,0, ctx[x].canvas.width, ctx[x].canvas.height);
      board[x].draw();
   }
}

let blinkTime = [null, null]
let blinkPeriode;
let stopAnimation = [false, false];
let colored = [null, null];
let blinkCall = [0, 0];
let playerGameOver = [false, false]

// Game Loop; pl stands for player - 0 for player1, 1 for player2
function animate(timestamp = 0, pl) {
   // Update elapsed time.  
   time[pl].elapsed = timestamp - time[pl].start;
   // If elapsed time has passed time for current level  
   if (time[pl].elapsed > time[pl].level) {
     // Restart counting from now
      time[pl].start = timestamp;   
      if (!board[pl].drop()) {
         playerGameOver[pl] = true;
         // Checking if both players finished the game
         if(playerGameOver[0] === true && playerGameOver[1] === true){
            gameOver();
         }
         return;
      }
      else {
         // Lines were cleared
         if (board[pl].linesCleared){
            // Stopping/ breaking out of current animation loop
            stopAnimation[pl] = true; 
            // Reset blinking animation time object
            blinkTime[pl] = { start: 0, elapsed: 0, periode: 300};
            blinkCall[pl] = 0;
            colored[pl] = true;
            // Start blinking animation
            SOUNDS.LINE.play();
            animateRowBlinking(timestamp, pl);
            // Wait until line gets deleted and animate gets called again - game loop continues
            setTimeout(() => {
               // Reset the linesCleared and stopAnimation
               board[pl].linesCleared = false;
               stopAnimation[pl] = false;
               // Draw new canvas
               ctx[pl].clearRect(0, 0, ctx[pl].canvas.width, ctx[pl].canvas.height);    
               board[pl].draw();
               SOUNDS.SHIFT.play(); 
               animate(timestamp, pl);
            }, 2500)
         }
      }
   }
   if(!stopAnimation[pl]){
      ctx[pl].clearRect(0, 0, ctx[pl].canvas.width, ctx[pl].canvas.height);    
      board[pl].draw();  
      requestId = requestAnimationFrame(function(timestamp){animate(timestamp, pl)});
   }
 }


function animateRowBlinking (timestamp , pl) {
   // Update elapsed time.  
   blinkTime[pl].elapsed = timestamp - blinkTime[pl].start;
   // Counting function calls
   blinkCall[pl]++;

   if (blinkTime[pl].elapsed > blinkTime[pl].periode) {
      // Restart counting from now
      blinkTime[pl].start = timestamp;   
      if(colored[pl]){
         board[pl].yDelete.forEach(y => {
            board[pl].grid[y].forEach((value, x) =>{
               board[pl].drawBlocks(BOARDCOLOR, x, y);
            })
         });
         colored[pl] = false;
      } else if(!colored[pl]){
         board[pl].yDelete.forEach(y => {
            board[pl].grid[y].forEach((value, x) =>{
               if (value > 0) {
                  board[pl].drawBlocks(COLORS[value - 1], x, y);
               }
            })
         });
         colored[pl] = true;
      }
   } 
   // Stopping blinking animation when
   if(blinkCall[pl] > 120){
      board[pl].yDelete.forEach(y => {
         board[pl].grid[y].forEach((value, x) =>{
            board[pl].drawBlocks(BOARDCOLOR, x, y);
         })
      });
      board[pl].grid.forEach((row, y) => {
         // If every value is greater than zero then we have a full row.
         if (row.every((value) => value > 0)) {
            // Remove the row.
            board[pl].grid.splice(y, 1);
            // Add zero filled row at the top.
            board[pl].grid.unshift(Array(COLS).fill(0));
         }
         });
      return;
   }
   requestAnimationFrame(function(timestamp){animateRowBlinking(timestamp, pl)});
}

function gameOver() {
   SOUNDS.THEME.loop = false;
   SOUNDS.THEME.pause()
   confetti.start();
   cancelAnimationFrame(requestId);
   document.removeEventListener('keydown', handleKeyDown)
   SOUNDS.GAMEOVER.play();
   printWinner();
}

let winner_text = document.querySelector(".winner");

function printWinner(){
   if(board_pl1.account.score_pl1 > board_pl2.account.score_pl2){
         winner_text.innerText = names[0].innerText + " won";
   }
   else {
      winner_text.innerText = names[1].innerText + " won";
   }
}

let names = document.querySelectorAll(".players-name");

let defaultText = names[0].innerText;

// Checking if names are entered
names.forEach(name => {
   name.addEventListener("input", function () {
      name.classList.add("edited-name")
      if(names[0].innerText != defaultText && names[1].innerText != defaultText) {
         playBtn.removeAttribute('disabled');
      }
   })
})

let music_button = document.querySelector("#music");

// Switching on and off the music when clicking #music element 
function switchMusic() {
   if(SOUNDS.THEME.paused){
      SOUNDS.THEME.play();
      music_button.innerText = "music on";
   } 
   else {
      SOUNDS.THEME.pause();
      music_button.innerText = "music off";
   }
}







