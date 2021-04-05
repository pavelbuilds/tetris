class Piece {
   constructor(ctx) {
      this.ctx = ctx;
      this.spawn();
   }

   spawn() {
      this.typeId = this.randomizeTetrominoType(SHAPES.length - 1);
      this.shape = SHAPES[this.typeId];
      this.color = COLORS[this.typeId];
      this.x = 0;
      this.y = 0;
    }

   draw(){
      this.shape.forEach((rows,y) => {
         rows.forEach((value, x) => {
            if (value > 0) {

               this.ctx.beginPath();
               this.ctx.moveTo(this.x + x, this.y + y);
               this.ctx.lineTo(this.x + x + 1.01, this.y + y);
               this.ctx.lineTo(this.x + x, this.y + y + 1);
               this.ctx.lineTo(this.x + x, this.y + y);
               this.ctx.fillStyle = this.color[0];
               this.ctx.fill();

               this.ctx.beginPath();
               this.ctx.moveTo(this.x + x + 1,this.y + y);
               this.ctx.lineTo(this.x + x + 1, this.y + y + 1);
               this.ctx.lineTo(this.x + x - 0.01, this.y + y + 1);
               this.ctx.lineTo(this.x + x + 1,this.y + y);
               this.ctx.fillStyle = this.color[1];
               this.ctx.fill();

               this.ctx.fillStyle = this.color[2];
               this.ctx.fillRect(this.x + x + 0.15, this.y + y + 0.15, 0.7, 0.7);
            }
         });
      });
   }

   move(p) {
      this.x = p.x;
      this.y = p.y;
      this.shape = p.shape;
   }

   randomizeTetrominoType(noOfTypes) {
      return Math.floor(Math.random() * noOfTypes);
    }

   setStartingPosition() {
      // Setting the x-starting coordinate based on tetrominoe width
      this.x = this.typeId === 4 ? 4 : 3;
   }
}