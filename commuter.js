const bgcanvas = document.getElementById('background');
const obstcanvas = document.getElementById('obstacleCanvas');
const bikecanvas = document.getElementById('bikeCanvas');
const topcanvas = document.getElementById('topCanvas');

const bgctx = bgcanvas.getContext('2d');
const obstctx = obstcanvas.getContext('2d');
const bikectx = bikecanvas.getContext('2d');
const topctx = topcanvas.getContext('2d');

class individualObj {
  constructor(row, col, width, height) {
    this.row = row;
    this.col = col;
    this.width = width;
    this.height = height;
  }

  reset() {
    bikectx.clearRect(40*(fieldXOffset + this.col), 40*this.row, this.width, this.height);
    this.row = 0;
    this.col = 0;
  }
}

const fieldWidth   = 12;
const fieldXOffset = 2;
const BLOCKSIZE    = 40;
var cyclist = new individualObj(13,6,40,80);
var pizza = new individualObj(0,0,40,40);
var windowOpen     = false;
var showAbout      = false;

class game {
  constructor() { 
    this.scoreTimer = null;
    this.updateTimer = null;
    this.score = 0;
    this.cycle = 1;
    this.difficulty = 4;
    this.gameSpeed = 500;
    this.setBackground();
    this.resetBoard();
    // load high score
    this.highscore = parseInt(localStorage.getItem("highscore"));
    if (!this.highscore) {
      localStorage.setItem("highscore", 0);
      this.highscore = 0;
    }
  }
  
  start() {
    drawCyclist(cyclist.row, fieldXOffset + cyclist.col);
    // obstctx.clearRect(0, 0, obstcanvas.width, obstcanvas.height);
    showWindow("Commuter", "Start");
    drawScore();
    drawHighscore();
  }
  
  new() {
    // reset vars
    this.score = 0;
    this.resetBoard();
    this.cycle = 1;
    this.difficulty = 4;
    this.gameSpeed = 500;

    // clear popup window
    topctx.clearRect(0, 0, topcanvas.width, topcanvas.height);
    drawScore();
    drawHighscore();

    // clear the bike canvas and draw a fresh rider
    bikectx.clearRect(0, 0, bikeCanvas.width, bikeCanvas.height);
    drawCyclist(cyclist.row, fieldXOffset + cyclist.col);

    // start game
    obstctx.clearRect(0, 0, obstcanvas.width, obstcanvas.height);
    this.updateTimer = setInterval(updateGameboard, this.gameSpeed);
  }
  
  gameover() {
    clearInterval(this.updateTimer);
    clearInterval(this.scoreTimer);
    windowOpen = true;
    setTimeout(function() {
      // check if new highscore
      if (myGame.score > myGame.highscore) {
        myGame.highscore = myGame.score;
        localStorage.setItem("highscore", myGame.highscore);
        drawHighscore();
        showWindow("Highscore", "Retry");
      } else {
        showWindow("Game Over", "Retry");
      }
    }, 500);
  }

  resetBoard() {
    this.gameboard = [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0]
      ];
  }

  setBackground() {
    drawSidewalk();
    drawRoadLines();
  }

  increaseDiff() {
    this.difficulty += 2;
    console.log("diff: " + this.difficulty);
  }

  increaseGameSpeed() {
    if (this.gameSpeed > 100) {
      this.gameSpeed -= 20;
      clearInterval(this.updateTimer);
      this.updateTimer = setInterval(updateGameboard, this.gameSpeed);
    }
  }

  upScore(increaseVal) {
    this.score += increaseVal;
    if (this.score > (this.difficulty * 10)) {
      this.increaseDiff();
      this.increaseGameSpeed();
    }
  }
}

const myGame = new game();
setTimeout(myGame.start, 100);

class clickArea {
  constructor(x, y, width, height, callback) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.callback = callback;
  }
  
  updateArea(x, y, width, height, callback) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.callback = callback;
  }
}

const buttonClick = new clickArea(0,0,0,0,null);

const LEFT  = 37;
const UP    = 38;
const RIGHT = 39;
const DOWN  = 40;
const ENTER = 13;

document.addEventListener('keydown', function(event) {
  var prevRow = cyclist.row;
  var prevCol = cyclist.col;
  
  if (!windowOpen) {
    if(event.keyCode == DOWN) {cyclist.row = (cyclist.row++>=13)?13:cyclist.row;}
    else if(event.keyCode == UP) {cyclist.row = (cyclist.row--<=6)?6:cyclist.row;} 
    else if(event.keyCode == LEFT) {cyclist.col = (cyclist.col--<=0)?0:cyclist.col;}
    else if(event.keyCode == RIGHT) {cyclist.col = (cyclist.col++>=11)?11:cyclist.col;}
  

    if (isCollision()) {
      drawCrash(cyclist.row, fieldXOffset + cyclist.col, prevRow, fieldXOffset + prevCol);
      myGame.gameover();
    } else {
      if (collectPizza()) {
        pizza.reset();
        myGame.upScore(30);
      }
      drawCyclist(cyclist.row, fieldXOffset + cyclist.col, prevRow, fieldXOffset + prevCol);
    }
  } else {
    if(event.keyCode == 13) { buttonClick.callback(); } // [enter] key
    else if(event.keyCode == 65) { toggleAbout(); } // [a] key
  }
});

topcanvas.addEventListener('click', function(event) {
  if (windowOpen) {
    const pos = {
      x: event.clientX - document.getElementById("contain").offsetLeft,
      y: event.clientY - document.getElementById("contain").offsetTop
    };
    
    if((pos.x > buttonClick.x) && (pos.x < (buttonClick.x + buttonClick.width)) &&
      (pos.y > buttonClick.y) && (pos.y < (buttonClick.y + buttonClick.height))) {
      if (buttonClick.callback != null) {
        buttonClick.callback();
      }
    }
  }
  
});

//create a synth and connect it to the master output (your speakers)
// var synth = new Tone.PluckSynth().toMaster()

// //play a middle 'C' for the duration of an 8th note
// //schedule a few notes
// Tone.Transport.schedule(triggerSynth, 0)
// Tone.Transport.schedule(triggerSynth2, '0:2')
// Tone.Transport.schedule(triggerSynth, '0:2:2.5')

// //set the transport to repeat
// Tone.Transport.loopEnd = '1m'
// Tone.Transport.loop = true

function updateGameboard() {
  // clear board
  obstctx.clearRect(0, 0, obstcanvas.width, obstcanvas.height);

  if (myGame.cycle) {

  } else {
    // generate new pothole
    var randomCol = Math.floor(Math.random() * fieldWidth);
    if (myGame.gameboard[0][randomCol] == 0) {
      myGame.gameboard[0][randomCol] = 10;
    }
  }
  var chance = Math.floor(Math.random()*50);
  if (chance == 0) {
    if (!pizza.row) {
      pizza.row = Math.floor(Math.random()*9) + 6;
      pizza.col = Math.floor(Math.random()*12);
      drawPizza(pizza.row, fieldXOffset + pizza.col);
    }
  } else if (chance <= myGame.difficulty) {
    if (chance % 2) {
      if (myGame.gameboard[0][0] == 0) {
        myGame.gameboard[0][0] = 8;
        myGame.gameboard[0][1] = 9;
      }
    } else {
      if (myGame.gameboard[0][10] == 0) {
        myGame.gameboard[0][10] = 4;
        myGame.gameboard[0][11] = 9;
      }
    }
  }

  // draw field
  for(var row=16; row>=0; row--) {
    for(var col=0; col<fieldWidth; col++) {
      if (row) {
        myGame.gameboard[row][col] = myGame.gameboard[row-1][col];
        switch(myGame.gameboard[row][col]) {
          // car facing up
          case 1: // full car
            drawCarUp(row-1, fieldXOffset + col);
            break;
          case 2: // 3/4 car
            drawCarUp(row-2, fieldXOffset + col);
            break;
          case 3: // 3/4 car
            drawCarUp(row-3, fieldXOffset + col);
            break;
          case 4: // 3/4 car
            drawCarUp(row-4, fieldXOffset + col);
            break;

          // car facing down
          case 5: // full car
            drawCarDown(row-1, fieldXOffset + col);
            break;
          case 6: // 3/4 car
            drawCarDown(row-2, fieldXOffset + col);
            break;
          case 7: // 2/4 car
            drawCarDown(row-3, fieldXOffset + col);
            break;
          case 8: // 1/4 car
            drawCarDown(row-4, fieldXOffset + col);
            break;

          // pothole
          case 10:
            drawPothole(fieldXOffset + col, row-1);
            break;

          default:
            break;
        }
      } else {
        var indexAbove = myGame.gameboard[row+1][col]
        if (((indexAbove > 1) && (indexAbove < 5)) || ((indexAbove > 5) && (indexAbove < 9))) {
          myGame.gameboard[row][col] = indexAbove - 1;
          myGame.gameboard[row][col+1] = 9;
          myGame.gameboard[row+1][col] = 9;
          col++;
        } else {
          myGame.gameboard[row][col] = 0;
        }
      }
    }
  }
  if (isCollision()) {
    // collision
    drawCrash(cyclist.row, fieldXOffset + cyclist.col);
    myGame.gameover();
  } else if ((cyclist.col <= 1) || (cyclist.col >= 10)) {
    myGame.upScore(1);
  }
  drawScore();
  myGame.cycle = (myGame.cycle+1) % 4;
}

function isCollision() {
  return (myGame.gameboard[cyclist.row+1][cyclist.col] || myGame.gameboard[cyclist.row+2][cyclist.col]);
}

function collectPizza() {
  return ((pizza.row == cyclist.row) || (pizza.row == (cyclist.row + 1))) && (pizza.col == cyclist.col)
}

function drawScore() {
  topctx.textAlign = "right";
  topctx.font = "28px Press-Start-2P";
  topctx.clearRect(topcanvas.width-120, 0, 120, 40)
  topctx.fillText(myGame.score, topcanvas.width, 35);
}

function drawHighscore() {
  topctx.textAlign = "left";
  topctx.font = "28px Press-Start-2P";
  topctx.clearRect(0, 0, 120, 40)
  topctx.fillText(myGame.highscore, 5, 35);
}

function drawPothole(x,y) {
  obstctx.fillRect(BLOCKSIZE*x+10,BLOCKSIZE*y+15,20,20);
  obstctx.fillRect(BLOCKSIZE*x+5,BLOCKSIZE*y+10,5,20);
  obstctx.fillRect(BLOCKSIZE*x,BLOCKSIZE*y+15,20,5);
  obstctx.fillRect(BLOCKSIZE*x,BLOCKSIZE*y+25,40,5);
  obstctx.fillRect(BLOCKSIZE*x+15,BLOCKSIZE*y+10,20,5);
}

function drawCyclist(row, col, prevRow, prevCol) {
  bikectx.clearRect(BLOCKSIZE*prevCol,BLOCKSIZE*prevRow,BLOCKSIZE,BLOCKSIZE*2);
  
  bikectx.fillRect(BLOCKSIZE*col,BLOCKSIZE*row+20,35,30);
  bikectx.clearRect(BLOCKSIZE*col+5,BLOCKSIZE*row+25,25,20);
  bikectx.clearRect(BLOCKSIZE*col+10,BLOCKSIZE*row+20,15,5);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row,5,25);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row+30,5,50);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+30,15,35);
  bikectx.fillRect(BLOCKSIZE*col+5,BLOCKSIZE*row+BLOCKSIZE,25,20);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+15,15,5);
}

function drawCrash(row, col, prevRow, prevCol) {
  bikectx.clearRect(BLOCKSIZE*col,BLOCKSIZE*row,BLOCKSIZE,BLOCKSIZE*2);
  bikectx.clearRect(BLOCKSIZE*prevCol,BLOCKSIZE*prevRow,BLOCKSIZE,BLOCKSIZE*2);
  
  // body
  bikectx.fillRect(BLOCKSIZE*col-30,BLOCKSIZE*row,5,80);
  bikectx.fillRect(BLOCKSIZE*col-35,BLOCKSIZE*row+5,15,10);
  bikectx.fillRect(BLOCKSIZE*col-30,BLOCKSIZE*row+15,15,40);
  bikectx.fillRect(BLOCKSIZE*col-BLOCKSIZE,BLOCKSIZE*row+25,5,25);
  bikectx.fillRect(BLOCKSIZE*col-35,BLOCKSIZE*row+20,5,10);
  bikectx.fillRect(BLOCKSIZE*col-15,BLOCKSIZE*row+50,5,30);
  bikectx.fillRect(BLOCKSIZE*col-10,BLOCKSIZE*row+75,5,5);
  bikectx.fillRect(BLOCKSIZE*col-35,BLOCKSIZE*row+75,5,5);
  bikectx.fillRect(BLOCKSIZE*col-15,BLOCKSIZE*row+15,5,5);
  bikectx.fillRect(BLOCKSIZE*col-10,BLOCKSIZE*row+10,5,5);
  bikectx.fillRect(BLOCKSIZE*col-5,BLOCKSIZE*row,5,10);
  
  // bike
  bikectx.fillRect(BLOCKSIZE*col-10,BLOCKSIZE*row+25,5,10);
  bikectx.fillRect(BLOCKSIZE*col-5,BLOCKSIZE*row+45,5,15);
  bikectx.fillRect(BLOCKSIZE*col-5,BLOCKSIZE*row+20,25,5);
  bikectx.fillRect(BLOCKSIZE*col,BLOCKSIZE*row+20,5,35);
  bikectx.fillRect(BLOCKSIZE*col+5,BLOCKSIZE*row+50,5,20);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+45,5,15);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row+45,15,5);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+70,5,5);
  bikectx.fillRect(BLOCKSIZE*col+30,BLOCKSIZE*row+70,5,5);
  bikectx.fillRect(BLOCKSIZE*col+30,BLOCKSIZE*row+50,5,5);
  bikectx.fillRect(BLOCKSIZE*col+35,BLOCKSIZE*row+55,5,15);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row+75,15,5);
  bikectx.fillRect(BLOCKSIZE*col+30,BLOCKSIZE*row+25,5,5);
  bikectx.fillRect(BLOCKSIZE*col+30,BLOCKSIZE*row+5,5,5);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+25,5,5);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+5,5,5);
  bikectx.fillRect(BLOCKSIZE*col+20,BLOCKSIZE*row+15,5,5);
  bikectx.fillRect(BLOCKSIZE*col+35,BLOCKSIZE*row+10,5,15);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row,15,5);
  bikectx.fillRect(BLOCKSIZE*col+10,BLOCKSIZE*row+30,20,5);
  bikectx.fillRect(BLOCKSIZE*col+5,BLOCKSIZE*row+10,5,20);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row+35,5,5);
  bikectx.fillRect(BLOCKSIZE*col+20,BLOCKSIZE*row+BLOCKSIZE,5,25);
  bikectx.fillRect(BLOCKSIZE*col+15,BLOCKSIZE*row+60,5,5);
}

function drawCarUp(row, col) {
  // obstctx.clearRect(40*col,80*row,40,80);
  
  obstctx.fillRect(40*col+20, 40*row, 40, 160);
  obstctx.fillRect(40*col+10, 40*row+5, 60, 155);
  obstctx.fillRect(40*col+5, 40*row+10, 70, 145);
  obstctx.fillRect(40*col, 40*row+50, 80, 10);
  
  obstctx.clearRect(40*col+25, 40*row+115, 30, 25);
  obstctx.clearRect(40*col+20, 40*row+120, 40, 15);
  obstctx.clearRect(40*col+35, 40*row+145, 10, 5);
  obstctx.clearRect(40*col+20, 40*row+85, 5, 15);
  obstctx.clearRect(40*col+15, 40*row+70, 5, 40);
  obstctx.clearRect(40*col+55, 40*row+85, 5, 15);
  obstctx.clearRect(40*col+60, 40*row+70, 5, 40);
  obstctx.clearRect(40*col+25, 40*row+40, 30, 35);
  obstctx.clearRect(40*col+20, 40*row+45, 40, 20);
  obstctx.clearRect(40*col+15, 40*row+50, 50, 5);
  obstctx.clearRect(40*col+15, 40*row+10, 5, 5);
  obstctx.clearRect(40*col+10, 40*row+15, 5, 5);
  obstctx.clearRect(40*col+60, 40*row+10, 5, 5);
  obstctx.clearRect(40*col+65, 40*row+15, 5, 5);
  // rear lights
  // obstctx.clearRect(40*col+65, 40*row+145, 5, 5);
  // obstctx.clearRect(40*col+60, 40*row+150, 5, 5);
  // obstctx.clearRect(40*col+15, 40*row+150, 5, 5);
  // obstctx.clearRect(40*col+10, 40*row+145, 5, 5);
}

function drawCarDown(row, col) {
  obstctx.fillRect(40*col+20, 40*row, 40, 160);
  obstctx.fillRect(40*col+10, 40*row, 60, 155);
  obstctx.fillRect(40*col+5, 40*row+5, 70, 145);
  obstctx.fillRect(40*col, 40*row+100, 80, 10);
  
  obstctx.clearRect(40*col+25, 40*row+20, 30, 25);
  obstctx.clearRect(40*col+20, 40*row+25, 40, 15);
  obstctx.clearRect(40*col+35, 40*row+10, 10, 5);
  obstctx.clearRect(40*col+20, 40*row+60, 5, 15);
  obstctx.clearRect(40*col+15, 40*row+50, 5, 40);
  obstctx.clearRect(40*col+55, 40*row+60, 5, 15);
  obstctx.clearRect(40*col+60, 40*row+50, 5, 40);
  obstctx.clearRect(40*col+25, 40*row+85, 30, 35);
  obstctx.clearRect(40*col+20, 40*row+95, 40, 20);
  obstctx.clearRect(40*col+15, 40*row+105, 50, 5);
  obstctx.clearRect(40*col+15, 40*row+145, 5, 5);
  obstctx.clearRect(40*col+10, 40*row+140, 5, 5);
  obstctx.clearRect(40*col+60, 40*row+145, 5, 5);
  obstctx.clearRect(40*col+65, 40*row+140, 5, 5);
}

function drawPizza(row, col) {
  bikectx.fillRect(40*col, 40*row+25, 10, 15);
  bikectx.fillRect(40*col+5, 40*row+15, 15, 20);
  bikectx.fillRect(40*col+10, 40*row, 20, 30);
  bikectx.fillRect(40*col+30, 40*row+5, 10, 20);
  bikectx.fillRect(40*col+25, 40*row+30, 5, 5);
  
  bikectx.clearRect(40*col+10, 40*row, 5, 5);
  bikectx.clearRect(40*col+35, 40*row+5, 5, 5);
  bikectx.clearRect(40*col+15, 40*row+5, 5, 5);
  bikectx.clearRect(40*col+20, 40*row+10, 5, 5);
  bikectx.clearRect(40*col+25, 40*row+15, 5, 5);
  bikectx.clearRect(40*col+10, 40*row+15, 5, 5);
  bikectx.clearRect(40*col+15, 40*row+20, 5, 5);
  bikectx.clearRect(40*col+5, 40*row+25, 5, 5);
}

function fillBrickRect(x, y, width, height) {
  for (var i=0;i<width;i+=5) {
    for (var j=0;j<height;j+=5) {
      if (i % 3) {
        if (i % 3 - 1)
        bgctx.fillRect(x+i,y+j,10,((j+i)%20)?0:5);
      } else {
        bgctx.fillRect(x+i, y+j, 5, 5)
      }
    }
  }
}

function drawSidewalk() {
  fillBrickRect(0,0,BLOCKSIZE*2,BLOCKSIZE*16);
  fillBrickRect((fieldXOffset + fieldWidth)*40,0,BLOCKSIZE*2,BLOCKSIZE*16);
  // clear area for scores
  bgctx.clearRect(bgcanvas.width-120, 0, 120, 40)
  bgctx.clearRect(0, 0, 120, 40)
}

function drawRoadLines() {
  for (var i=0; i<bgcanvas.height; i+=5) {
    bgctx.fillRect(BLOCKSIZE*(fieldXOffset + 2), i, 5, (i%10)?0:5)
    bgctx.fillRect(BLOCKSIZE*(fieldXOffset + fieldWidth - 2) - 5, i, 5, (i%10)?0:5)
  }
  if (true) {
    for (var i=0; i<bgcanvas.height; i+=20) {
      bgctx.fillRect(BLOCKSIZE*(fieldXOffset + fieldWidth/2) - 5, i, 10, (i%40)?0:20)
    }
  } else {
    for (var i=0; i<bgcanvas.height; i+=20) {
      bgctx.fillRect(BLOCKSIZE*(fieldXOffset + fieldWidth/2) - 5, i, 10, (i%40)?20:0)
    }
  }
}

function showWindow(displayText, buttonText) {
  windowOpen = true;
  
  var xOffset = BLOCKSIZE*4;
  var yOffset = BLOCKSIZE*2;
  var width = BLOCKSIZE*8;
  var height = BLOCKSIZE*9;
  
  topctx.fillStyle = "#ccc";
  topctx.fillRect(xOffset,yOffset,width,height);
  topctx.fillStyle = "black";
  topctx.lineWidth = 5;
  topctx.strokeRect(xOffset,yOffset,width,height);
  
  topctx.textAlign = "center";
  topctx.font = "30px Press-Start-2P";
  topctx.fillText(displayText, xOffset + width/2, yOffset + BLOCKSIZE + 25);
  
  topctx.font = "18px Press-Start-2P";
  var startHeight = BLOCKSIZE*3;
  topctx.fillText("Avoid cars and", xOffset + width/2, yOffset + startHeight);
  topctx.fillText("potholes", xOffset + width/2, yOffset + startHeight+25);
  topctx.fillText("Hang in the bike", xOffset + width/2, yOffset + startHeight + 70);
  topctx.fillText("lane and collect", xOffset + width/2, yOffset + startHeight + 95);
  topctx.fillText("pizza!", xOffset + width/2, yOffset + startHeight + 120);
  
  topctx.fillRect(xOffset + 40, yOffset + BLOCKSIZE*7, width - 80, 40);
  topctx.fillStyle = "#ccc";
  topctx.font = "24px Press-Start-2P";
  topctx.fillText(buttonText, xOffset + width/2, yOffset + BLOCKSIZE*7 + 34)
  
  topctx.fillStyle = "black";
  
  buttonClick.updateArea(xOffset + 40, yOffset + BLOCKSIZE*7, width - 80, 40, windowClose);
}

function toggleAbout() {
  if (windowOpen) {
    var xOffset = BLOCKSIZE*4;
    var yOffset = BLOCKSIZE*2;
    var width = BLOCKSIZE*8;
    var height = BLOCKSIZE*9;

    showAbout = !showAbout;
    
    var startHeight = BLOCKSIZE*3;
    topctx.fillStyle = "#ccc";
    topctx.fillRect(xOffset + 10, yOffset + startHeight - 20, width - 20, BLOCKSIZE*3 + 20);

    topctx.textAlign = "center";
    topctx.font = "18px Press-Start-2P";
    topctx.fillStyle = "black";
    if (showAbout) {
      topctx.fillText("by Rob Rehr", xOffset + width/2, yOffset + startHeight);
      topctx.fillText("@mediumrehr", xOffset + width/2, yOffset + startHeight+25);
      topctx.fillText("Inspired by the", xOffset + width/2, yOffset + startHeight + 70);
      topctx.fillText("Chicago streets", xOffset + width/2, yOffset + startHeight + 95);
      topctx.fillText("- Fall 2018 -", xOffset + width/2, yOffset + startHeight + 120);
    } else {
      topctx.fillText("Avoid cars and", xOffset + width/2, yOffset + startHeight);
      topctx.fillText("potholes", xOffset + width/2, yOffset + startHeight+25);
      topctx.fillText("Hang in the bike", xOffset + width/2, yOffset + startHeight + 70);
      topctx.fillText("lane and collect", xOffset + width/2, yOffset + startHeight + 95);
      topctx.fillText("pizza!", xOffset + width/2, yOffset + startHeight + 120);
    }
  }
}

function windowClose() {
  windowOpen = false;
  showAbout = false;
  buttonClick.updateArea(0, 0, 0, 0, null);
  myGame.new();
}