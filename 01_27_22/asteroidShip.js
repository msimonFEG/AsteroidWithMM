const FPS = 300; // frames per second
const SHIP_SIZE = 30; // ship height in pixels
const TURN_SPEED = 180; // turn speed in degrees per second
const SHIP_THRUST = 3; //accleration
const FRICTION = 0.7 //friction (0 = none, 1 = a lot)
const ASTEROID_NUM = 3 //starting number of asteroids
const ASTEROID_SPEED = 50 //starting asteroid speed
const ASTEROID_SIZE = 100 //starting asteroid size in pixels
const ASTEROID_VERT = 10 // avg number of vertices for each ateroid
const ASTEROID_JAG = 0 // jaggedness of asteroid, affected by ASTEROID_SIZE
const SHOW_BOUNDING = true; //shows collision bounding
const SHIP_EXPLODE_DUR = 0.3 //duration of ships explosion
const SHIP_INV_DUR = 3 //ship invisibillity by seconds
const SHIP_BLINK_DUR = 0.1 // duration of blinking during invisibility

var canvas;
var ctx;
var ship = newShip();

var asteroids = [];

var moveLeft = false;
var moveRight = false;
var moveDown = false;
var moveUp = false;
var lastRender = 0;

function setupCanvasCtx() {
    canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    createAsteroidBelt();
    window.requestAnimationFrame(loop);
    // draw()
}

function draw() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height) //this erases everything in canvas. meant to clear a frame.
    
    ctx.fillStyle = "#000000"; //background black
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw ship
    if (!exploding) {
        if (blinkOn) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.d( //nose of ship
                ship.x + 4 / 3 * ship.r * Math.cos(ship.a),  
                ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
                );
            ctx.lineTo( //left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),  
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
                );
            ctx.lineTo( //right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),  
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
                );
                ctx.closePath(); //close the path
                ctx.stroke();
        }

        //handle blinking
        if (ship.blinkNum > 0 ) {
            //reduce blink duration
            ship.blinkTime--;

            //reduce blink num
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }
    } else {
        // draw explosion
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 1.7, 0, Math.PI * 2, false)
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 1.4, 0, Math.PI * 2, false)
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 1.1, 0, Math.PI * 2, false)
        ctx.fill();
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0.8, 0, Math.PI * 2, false)
        ctx.fill();
    }
    
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false)
        ctx.stroke();
    }

    //draw thrust
    if (ship.thursting == true) {

        if (!exploding) {
            ctx.fillStyle = "#FF0000";
            ctx.strokeStyle = "#FFFF00";
            ctx.lineWidth = SHIP_SIZE / 10;
            ctx.beginPath();
            ctx.moveTo( //rear left
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 *  Math.sin(ship.a)),  
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
            );
            ctx.lineTo( //rear center
                ship.x - ship.r * 6 / 3 * Math.cos(ship.a),  
                ship.y + ship.r * 6 / 3 * Math.sin(ship.a)
            );
            ctx.lineTo( //rear right
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),  
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
            );
            ctx.closePath(); //close the path
            ctx.fill();
            ctx.stroke();
        }  
    }

    //center dot
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);

    //draw asteroids
    let x, y, r, a, vert, offs;
    for (let i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = SHIP_SIZE / 20;
        //get asteroid properties
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offs = asteroids[i].offs;

        // draw path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a) 
        );

        // draw polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // asteroid collision circle
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        //check for collision
        if (!exploding) {
            if (ship.blinkNum == 0) {
                for (let i = 0; i < asteroids.length; i++) {
                    if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                        explodeShip();
                    }
                }
            }
            //rotate
            ship.a += ship.rot;

            //move
            ship.x += ship.thrust.x;
            ship.y += ship.thrust.y;
        } else {
            ship.explodeTime--;
            if (ship.explodeTime == 0) {
                ship = newShip()
            }
        }
    }
}

function updateShipPosition() { // this will be the space ship later
    if (ship.thursting == true) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }
    
    if (moveLeft == true) {
        ship.rot = TURN_SPEED / 180 * Math.PI / FPS; // rotates left
        // square.x -= progress;
    }
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r
    }
    if (moveRight == true) {
        ship.rot = -TURN_SPEED / 180 * Math.PI / FPS; //rotates right
        // square.x += progress;
    }
    if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r
    }
    if (moveUp == true){
        ship.thursting = true;
        // square.y -= progress;
    }
    if (ship.y < 0 - ship.r) {
        ship.y += canvas.height + ship.r
    }
    if (moveDown == true){
        // square.y += progress;
    }
    if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r
    }
    
    // move asteroids
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].xv
        asteroids[i].y += asteroids[i].yv
        
        //asteroid pacman
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        }
        if (asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r
        }
        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        }
        if (asteroids[i].y > canvas.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r
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

function createAsteroidBelt() {
    asteroids = [];
    let x, y;
    for (let index = 0; index < ASTEROID_NUM; index++) {
        do {
            x = Math.floor(Math.random() * canvas.width)
            y = Math.floor(Math.random() * canvas.height)
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y));
        
    }
    // console.log(asteroids);
}

function distBetweenPoints(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS)

    //comment out is for debuging
    /* ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();
    */
}

function newAsteroid(x, y) {
    let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROID_SPEED / FPS *  (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROID_SPEED / FPS *  (Math.random() < 0.5 ? 1 : -1),
        r: ASTEROID_SIZE / 2,
        a: Math.random() * Math.PI * 2, // radians
        vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
        offs: []
    };
    //create the vertex offsets array
    for (let i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push(Math.random() + ASTEROID_JAG * 2 + 1 - ASTEROID_JAG)
    }
    return asteroid;
}

function newShip() {
    return {
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2, 
        r: SHIP_SIZE / 2, 
        a: 90 / 180 * Math.PI, //a is converting degrees to radians
        blinkNum: Math.ceil(SHIP_INV_DUR * SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        rot: 0, 
        thursting: false, 
        thrust: {x: 0, y: 0},
        explodeTime: 0
    }
}

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
