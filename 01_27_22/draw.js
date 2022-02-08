function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height) //this erases everything in canvas. meant to clear a frame.
    
    ctx.fillStyle = "#000000"; //background black
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw ship
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
    
                
    //draw thrust
    if (ship.thursting == true) {
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
    //center dot
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    
    //draw asteroids
    ctx.strokeStyle = "#708090";
    ctx.lineWidth = SHIP_SIZE / 20;
    var x, y, r, a, vert;
    for (let i = 0; i < asteroids.length; i++) {
        //get asteroid properties
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;

        // draw path
        ctx.beginPath();
        ctx.moveTo(
            x + r * Math.cos(a),
            y + r * Math.sin(a) 
        );

        // draw polygon
        for (let j = 0; j < vert; j++) {
            ctx.lineTo(
                x + r * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // move asteroid

        // pacman
    }

    //rotate
    ship.a += ship.rot;

    //move
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;


}