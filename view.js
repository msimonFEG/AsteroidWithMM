
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height) //this erases everything in canvas. meant to clear a frame.
    
    ctx.fillStyle = "#000000"; //background black
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    

    // draw ship
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo( //nose of ship
        ship.x + ship.r * Math.cos(ship.a),  
        ship.y - ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( //left
        ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),  
        ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( //right
        ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),  
        ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath(); //close the path

    //center
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);

    //rotate
    ship.a += ship.rot;

    //move
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    //draws ship
    ctx.stroke();
}
