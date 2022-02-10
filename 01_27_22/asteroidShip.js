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
const SHOW_BOUNDING = false; //shows collision bounding
const SHIP_EXPLODE_DUR = 0.3 //duration of ships explosion
const SHIP_INV_DUR = 100 //ship invisibillity by seconds
const SHIP_BLINK_DUR = 0.1 // duration of blinking during invisibility
const DEBUGGING = false; //allows debugging with indicators
const LASER_MAX = 10; // max number of lasers on screen
const LASER_SPD = 500; // speed of laser in pixels per seconds
const LASER_DIST = 0.6; //max distance lasers can travel
const LASER_EXPLODE_DUR = 0.1 //duration of explosion of laser in seconds

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
}

function draw() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height) //this erases everything in canvas. meant to clear a frame.
    
    ctx.fillStyle = "#000000"; //background black
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    //DEBUGGING
    if (DEBUGGING) {
        ctx.font = "20px Arial";
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Exlopding: ${exploding}`, canvas.width-200, canvas.height-100);
        ctx.fillText(`blinkOn: ${blinkOn}`, canvas.width-200, canvas.height-75);        
        ctx.fillText(`ship.blinkNum: ${ship.blinkNum}`, canvas.width-200, canvas.height-50);
        ctx.fillText(`ship.explodeTime: ${ship.explodeTime}`, canvas.width-200, canvas.height-25);
    }

    // draw ship
    if (!exploding) {
        if (blinkOn) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            ctx.moveTo( //nose of ship
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
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
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

    //draw lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            //draw explosion
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill()
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill()
        }
    }

    //detect laser hits asteroid
    let ax, ay, ar, lx, ly;
    for (let i = asteroids.length - 1; i >= 0; i--) {
        //grab asteroid properties
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;

        //loop over the lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
           
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            //detect hits
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar ) {
                //remove asteroid
                destroyAsteroid(i);
                //destroy asteroid and activate laser explosion
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;

            }
        }
    }

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

    }
    //check for collision
    if (!exploding) {
        if (ship.blinkNum == 0) {
            for (let i = 0; i < asteroids.length; i++) {
                if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
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
    
    for (let i = ship.lasers.length - 1; i >= 0; i--) {
                
        // check distance travelled
        if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        // handle explosion
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            // destroy laser after the duration
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i, 1);
                continue;
            }
        } else {
            // move laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            // calculate distance travelled
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        // laser pacman
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canvas.width;
        }
        if (ship.lasers[i].x > canvas.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canvas.height;
        }
        if (ship.lasers[i].y > canvas.height) {
            ship.lasers[i].y = 0;
        }
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


function createAsteroidBelt() {
    asteroids = [];
    let x, y;
    for (let index = 0; index < ASTEROID_NUM; index++) {
        do {
            x = Math.floor(Math.random() * canvas.width)
            y = Math.floor(Math.random() * canvas.height)
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)));
        
    }
    // console.log(asteroids);
}

function destroyAsteroid(index) {
    let x = asteroids[index].x
    let y = asteroids[index].y
    let r = asteroids[index].r


    //debug the index's r
    console.log(asteroids[0])

    //split asteroid
    if (r == Math.ceil(ASTEROID_SIZE / 2)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)));
    } else if (r == Math.ceil(ASTEROID_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)));
    }
    asteroids.splice(index, 1);
}


function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS)
}

function newAsteroid(x, y, r) {
    let asteroid = {
        x: x,
        y: y,
        xv: Math.random() * ASTEROID_SPEED / FPS *  (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ASTEROID_SPEED / FPS *  (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2, // radians
        vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
        offs: []
    };
    //create the vertex offsets array
    for (let i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push(Math.random() + ASTEROID_JAG * 2 + 1 - ASTEROID_JAG,)
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
        explodeTime: 0,
        canShoot: true,
        lasers: []
    }
}

function shootLaser() {
    //laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),  
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    //stop further shooting
    ship.canShoot = false;
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
    if (event.keyCode == 38 || event.keyCode == 87) { // moves forwards
        // sqaure.y--;
        moveUp = true;
    }
    if (event.keyCode == 40 || event.keyCode == 83) { //moves backwards
        // square.y++;
        moveDown = true;
        ship.thursting = false;
    } 
    if (event.keyCode == 32) { //shoots laser
        shootLaser();
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
    if (event.keyCode == 32) {
        ship.canShoot = true;
    }
});

function loop(timestamp) {
    var progress = (timestamp - lastRender) * SHIP_THRUST;
    // fps = progress/1000
    updateShipPosition(progress); 
    draw();
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}