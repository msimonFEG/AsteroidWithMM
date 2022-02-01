const FPS = 300; // frames per second
const SHIP_SIZE = 30; // ship height in pixels
const TURN_SPEED = 360; // turn speed in degrees per second
const SHIP_THRUST = 5; //accleration
const FRICTION = 0.7 //friction (0 = none, 1 = a lot)

var canvas;
var ctx;
var ship = {x: window.innerWidth / 2, y: window.innerHeight / 2, r: SHIP_SIZE / 2, a: 90 / 180 * Math.PI, rot: 0, thursting: false, thrust: {x: 0, y: 0}} //a is converting degrees to radians

var moveLeft = false;
var moveRight = false;
var moveDown = false;
var moveUp = false;

// window.onresize() // this function will get called any time you resize your window.  You can use it to update your canvas's dimensions, when ver you change the size the window.  Type "resize window javascript example" in google to find examples.

function setupCanvasCtx() {
    canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
}


function updateShipPosition() { // this will be the space ship later
    if (ship.thursting == true) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.x / FPS;
    }
    
    if (moveLeft == true) {
        ship.rot = TURN_SPEED / 180 * Math.PI / FPS; // rotates left
        // square.x -= progress;
        if (ship.x < 0 - ship.x) {
           ship.x += canvas.width
        }
    }
    if (moveRight == true) {
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS; //rotates right
        // square.x += progress;
        if (ship.x > canvas.width) {
            ship.x -= canvas.width
        }
    }
    if (moveUp == true){
        ship.thursting = true;
        // square.y -= progress;
        if (ship.y < 0 - ship.y) {
            ship.y += canvas.height
        }
    }
    if (moveDown == true){
        // square.y += progress;
        if (ship.y > canvas.height) {
            ship.y -= canvas.height
        }
    }
}

function loop(timestamp) {
    var progress = (timestamp - lastRender) * SHIP_THRUST;
    updateShipPosition(progress); 
    draw();
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}

var lastRender = 0;
window.requestAnimationFrame(loop);


document.addEventListener('keydown', function(event) {
    // start movement
    if (event.keyCode == 37 || event.keyCode == 65) { // moves left
        // square.x--;
        moveLeft = true;
        // ship.thursting = true;
    }
    if (event.keyCode == 39 || event.keyCode == 68) { //moves right
        // square.x++;
        moveRight = true;
        // ship.thursting = true;
    }
    if (event.keyCode == 87) { // moves forwards
        // sqaure.y--;
        moveUp = true;
    }
    if (event.keyCode == 83) { //moves backwards
        // square.y++;
        moveDown = true;
        ship.thursting = false;
    } 

    //start rotation
  
});


document.addEventListener('keyup', function(event) {
    // stop movement
    if (event.keyCode == 37 || event.keyCode == 65) {
        moveLeft = false;
        ship.thursting = false;
        ship.rot = 0
    }
    if (event.keyCode == 39 || event.keyCode == 68) {
        moveRight = false;
        ship.thursting = false;
        ship.rot = 0;
    }
    if (event.keyCode == 38 || event.keyCode == 87) {
        moveUp = false;
        ship.thursting = false;
    }
    if (event.keyCode == 40 || event.keyCode == 83) {
        moveDown = false;
        ship.thursting = false;
    }
});
