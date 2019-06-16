

var canvasX = 0, canvasY = 0;
var canvasWidth = 800, canvasHeight = 620;
var canvasBaseColor = 'black'

var racket1Y = 0, racket2Y=0;
var racketWidth = 10, racketHeight = 100;
var racketColor = 'yellow'

var ballX = 50, ballY=100;
var ballRadius = 10;
var initialSpeed = 10;
var ballSpeedX = initialSpeed, ballSpeedY=initialSpeed; 
var ballSpeedFactor = 0.35;
var ballColor = 'red';

var netWidth = 10;
var netBlockHeight = 20;
var netColor = 'green';

const TIME_INTERVAL = 1000/30;  // milliseconds

var canvas;   // info of dimension of the play area
var canvasContext;   // graphical info of the play area
var refreshIntervalId;  // used to stop the interval function
var isGameStopped = false;
var player1Score = 0;
var player2Score = 0;

/* ------------------------------- start of code ------------------------ */
window.onload = main;

function main () {

    document.addEventListener('keypress', stop);
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    racket1Y = canvasY+(canvasHeight-racketHeight)/2;
    racket2Y = racket1Y;
    //console.log(canvasHeight,canvasWidth)

    // support animation
    startGame();
    
    canvas.addEventListener('mousemove',firstRacketMovement);

}

function startGame() {
    refreshIntervalId = setInterval( function() {
        move();
        draw();
    }, TIME_INTERVAL);
}

function stop(event){

    
    if(event.code === "Space") {
        if(isGameStopped){
            startGame();
        }
        else {
            clearInterval(refreshIntervalId);
        }  
        isGameStopped = !isGameStopped;
    }
    
    if(event.code === "KeyR"){
        clearInterval(refreshIntervalId);
        resetGame();
        resetBallPosition();
        startGame();
    }
}

function resetGame(){
    player1Score = 0;
    player2Score = 0;
    isGameStopped = false;
    ballSpeedX = initialSpeed;
    ballSpeedY=initialSpeed;
}

function calculateMousePosition(event){
    var rectangle = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = event.clientX - rectangle.left - root.scrollLeft;
    var mouseY = event.clientY - rectangle.top - root.scrollTop;

    return {
        x:mouseX,
        y:mouseY
    }
}

/* --------------------- code for moving ball ------------------------ */
function move() {
    secondRacketMovement();
    caculateBallCoordinates();
}

function firstRacketMovement(){
    var mousePosition = calculateMousePosition(event);
    var mousePositionY = mousePosition.y;
    racket1Y = mousePositionY - racketHeight/2;
}

function secondRacketMovement(){

    if(ballX>=(canvasX+canvasWidth/2) && ballSpeedX>0){
        
        var racker2CenterY = racket2Y + racketHeight/2;

        if(racker2CenterY < ballY-racketHeight/2){
            racket2Y += racketHeight/5;
        }
        else if (racker2CenterY > ballY+racketHeight/2){
            racket2Y -= racketHeight/5;
        }
    }  
}

function caculateBallCoordinates() {

    var reset = false;
    if((ballX==(canvasX+racketWidth))
      && ((ballY>(racket1Y-2*ballRadius) && (ballY<(racket1Y+racketHeight+2*ballRadius))))) 
    {
        // the case where ball hits the left racket
        ballSpeedX = -1 * ballSpeedX;

        ballSpeedYAfterHit(racket1Y);
        
    }
    else if((ballX==(canvasX+canvasWidth-racketWidth-2*ballRadius))
      && ((ballY>(racket2Y-2*ballRadius) && (ballY<(racket2Y+racketHeight+2*ballRadius)) )))
    {
        // the case where ball hits the right racket
        ballSpeedX = -1 * ballSpeedX;

        ballSpeedYAfterHit(racket2Y);
       
    }
    else if (ballX>(canvasX+racketWidth) && ballX<(canvasX+canvasWidth-racketWidth)){
        // case when ball is in the canvas 
        // do nothing as ballX is incremented below
    }
    else {
        // case when any player misses to hit the ball
        if(ballSpeedX>0){
            // player2 missed so point to player1
            player1Score++;
        }
        else {
            // player1 missed so point to player2
            player2Score++;
        }
        resetBallPosition();

        reset = true;
    }

    if (!reset) {
        if(ballY>=canvasY+canvasHeight-2*ballRadius || ballY<=canvasY){
            ballSpeedY = -1 * ballSpeedY;
        } 
    }

    ballX = ballX + ballSpeedX;
    ballY = ballY + ballSpeedY;
    
}

function ballSpeedYAfterHit(racketY){

    var distanceFromRacketCenter = ballY + ballRadius - (racketY+racketHeight/2);
    ballSpeedY = distanceFromRacketCenter * ballSpeedFactor;

    // calculate how far from the center the ball is hit on the racket then give speed to the ball.
    // far from the center more is the speed.

    // var distanceFromRacketCenter = Math.abs(ballY + ballRadius - (racketY+racketHeight/2));
    // var distanceFactor = distanceFromRacketCenter/(racketHeight/2);

    // if(distanceFactor <= 0.1){
    //     ballSpeedY = initialSpeed;
    // }
    // else if(distanceFactor<=0.4){
    //     ballSpeedY = ballSpeedY * distanceFactor;
    // }
    // else {
    //     var errorFactor = (2*ballRadius)/racketHeight + 0.1;
    //     ballSpeedY = ballSpeedY * (1/(1+errorFactor-distanceFactor));
    // }
}

function resetBallPosition(){
    ballX = canvasX + canvasWidth/2;
    ballY = canvasY + canvasHeight/2;
    ballSpeedY = initialSpeed;
}




/* --------------------- code for drawing ------------------------ */

function draw() {

    
    // draw base canvas
    canvasContext.fillStyle = canvasBaseColor;
    canvasContext.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
    
    drawNet();

    // draw tennis racket
    canvasContext.fillStyle = racketColor;

    // draw left tennis racket
    canvasContext.fillRect(canvasX, racket1Y, racketWidth, racketHeight);
  
    // draw right tennis racket
    canvasContext.fillRect(canvasX+canvasWidth-racketWidth, racket2Y , racketWidth, racketHeight);
  
    // draw ball
    canvasContext.fillStyle = ballColor;
    var ballCenterX = ballX + ballRadius;
    var ballCenterY = ballY + ballRadius;
    canvasContext.beginPath();                      // since there is no fillArc method
    canvasContext.arc(ballCenterX, ballCenterY, ballRadius, 0, 2*Math.PI, true);
    canvasContext.fill();
    

    canvasContext.fillStyle = 'white';
    canvasContext.fillText(player1Score,canvasX+100,100);
    canvasContext.fillText(player2Score,canvasX+canvasWidth-100,100);
}

function drawNet(){

    canvasContext.fillStyle = netColor;
    for (var i=0;i<canvasHeight; i=i+20){
        canvasContext.fillRect(canvasX+canvasWidth/2-netWidth/2, canvasY+i, netWidth, netBlockHeight);
    }
}




