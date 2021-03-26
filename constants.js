'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const KEY = {
   LEFT: 37,
   RIGHT: 39,
   DOWN: 40,
   SPACE: 32,
   UP: 38,
   Q: 81
}

Object.freeze(KEY);

const ROTATION = {
   LEFT: 'left',
   RIGHT: 'right'
 };

 const COLORS = [  
   ['#55A241','#3C722D','#4D923A'],
   ['#434C9E','#2F356F','#3D468F'],
   ['#AA383E','#78272C','#9A3339'],
   ['#CCA828','#917819','#BA9823'],
   ['#B6562F','#7F3D20','#A34E2A'],
   ['#913DAA','#672A7A','#85389C'],
   ['#4BAFA2','#357E74','#459F94']
 ];

 const BOARDCOLOR =  [
    '#1C1E3F',
    '#111229',
    '#191A38'
 ]

 const SHAPES = [
   [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
   [[2, 0, 0], [2, 2, 2], [0, 0, 0]],
   [[0, 0, 3], // 0,0 -> 2,0 ; 0,1 -> 1,0 ; 0,2 -> 0,0
    [3, 3, 3], // 1,0 -> 2,1 ; 1,1 -> 1,1 ; 1,2 -> 0,1 
    [0, 0, 0]],// 2,0 -> 2,2 ; 2,1 -> 1,2 ; 2,2 -> 0,2
   [[4, 4], [4, 4]],
   [[0, 5, 5], [5, 5, 0], [0, 0, 0]],
   [[0, 6, 0], [6, 6, 6], [0, 0, 0]],
   [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
 ];

const POINTS = {
   SINGLE: 100,
   DOUBLE: 300,
   TRIPLE: 500,
   TETRIS: 800,
   SOFT_DROP: 1,
   HARD_DROP: 2
 }
 Object.freeze(POINTS);

 const LEVEL = {
   0: 800,
   1: 720,
   2: 630,
   3: 550,
   4: 470,
   5: 380,
   6: 300,
   7: 220,
   8: 130,
   9: 100,
   10: 80,
   11: 80,
   12: 80,
   13: 70,
   14: 70,
   15: 70,
   16: 50,
   17: 50,
   18: 50,
   19: 30,
   20: 30,
 };

 const LINES_PER_LEVEL = 10;

 const SOUNDS = {
    ROTATE: new Audio('sounds/rotate.mp3'),
    LAND: new Audio('sounds/land.mp3'),
    MOVE: new Audio ('sounds/move.mp3'),
    LEVEL: new Audio ('sounds/level.mp3'),
    TETRIS: new Audio ('sounds/tetris.mp3'),
    LINE: new Audio ('sounds/line.mp3'),
    SHIFT: new Audio ('sounds/shift.mp3'),
    GAMEOVER: new Audio ('sounds/gameover.mp3'),
    THEME: new Audio ('sounds/theme_song.mp3')
   }

