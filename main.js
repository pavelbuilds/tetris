const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

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

function play() {
   ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
   resetGame();
   animate();
}

const moves = {
   [KEY.LEFT]: p => ({...p, x: p.x - 1}),
   [KEY.RIGHT]: p => ({...p, x: p.x + 1}),
   [KEY.DOWN]: p => ({...p, y: p.y + 1}),
   [KEY.SPACE]: p => ({...p, y: p.y + 1}),
   [KEY.UP]: (p) => board.rotate(p)
}

document.addEventListener('keydown', event => {
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
      }
      // Checking if the move is valid
      if(board.valid(p)){
         //If the move is valid, move the piece.
         board.piece.move(p);
         if(event.keyCode === KEY.DOWN){
            account.score += POINTS.SOFT_DROP;
         }
         // Clear old position before drawing.
      }
      ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
      board.draw();
   }
})

let time = null;
let stopAnimation = false;

function animate(now = 0) {
   // Update elapsed time.  
   time.elapsed = now - time.start;
   // If elapsed time has passed time for current level  
   if (time.elapsed > time.level) {
     // Restart counting from now
      time.start = now;   

      if (!board.drop()) {
         gameOver();
         return;
      }
      // Clear board before drawing new state.
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
      
      board.draw();  

      }
   if(!stopAnimation){
      requestId = requestAnimationFrame(animate);
   }
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

 function resetGame() {
   account.score = 0;
   account.lines = 0;
   account.level = 0;
   account.nextLevel = 1;
   account.linesNextLevel = 10;
   board.reset();
   time = { start: 0, elapsed: 0, level: 1000 };
 }


function gameOver() {
   cancelAnimationFrame(requestId);
   ctx.fillStyle = 'black';
   ctx.fillRect(1, 3, 8, 1.2);
   ctx.font = '1px Arial';
   ctx.fillStyle = 'red';
   ctx.fillText('GAME OVER', 1.8, 4);
 }


