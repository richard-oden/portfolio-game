// Made using the amazing tutorial by Jason Brown:
// https://somethinghitme.com/2013/01/09/creating-a-canvas-platformer-tutorial-part-one/

// Poly fill taken from Paul Irish's blog: 
// https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

const game = document.getElementById("game");
const ctx = game.getContext("2d");
game.height = game.width * .5; // Maintain aspect ratio of canvas

const friction = 0.8;
const gravity = 0.3;

let player = { 
    x:          game.width / 2, 
    y:          game.height - 5, 
    width:      5, 
    height:     5, 
    speed:      3, 
    velX:       0, 
    velY:       0,
    jumping:    false,
    grounded:   false
};

let collisions = [];
collisions.push({ x: 0, y: 0, width: 2, height: game.height }); // left border
collisions.push({ x: 0, y: game.height - 2, width: game.width, height: 2 }); // bottom border
collisions.push({ x: game.width - 2, y: 0, width: 2, height: game.height }); // right border
collisions.push({ x: 0, y: 0, width: game.width, height: 2 }); // top border
collisions.push({x: 0, y: game.height - 20, width: 20, height: 2});


function moveEntity(entity, direction) {
    switch(direction) {
        case "up":
            if (!entity.jumping && entity.grounded) {
                entity.jumping = true;
                entity.grounded = false;
                entity.velY = -entity.speed * 2;
            }
            break;
        case "right":
            if (entity.velX < entity.speed) {
                entity.velX++;
            }
            break;
        case "left":
            if (entity.velX > -entity.speed) {
                entity.velX--;
            }
            break;
    }
}

function applyPhysics(entity) {
    entity.velX *= friction;
    entity.velY += gravity;
    if (entity.grounded) entity.velY = 0;
    entity.x += entity.velX; 
    entity.y += entity.velY;
}

// function checkBounds(entity) {
//     if (entity.x >= game.width - entity.width) {
//         entity.x = game.width - entity.width;
//     } else if (entity.x <= 0) {
//         entity.x = 0;
//     }

//     if (entity.y >= game.height - entity.height) {
//         entity.y = game.height - entity.height;
//         entity.jumping = false;
//     }
// }

function applyCollision(entity, direction) {
    if (direction === "left" || direction === "right") { 
        entity.velX = 0; 
        entity.jumping = false; 
    } else if (direction === "bottom") { 
        entity.grounded = true; 
        entity.jumping = false; 
    } else if (direction === "top") { 
        entity.velY *= -1; 
    }
}

function collisionCheck(shapeA, shapeB) { 
    // Get centers of each shape and get distance between them:
    let distanceX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)), 
        distanceY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)), 
        // Add the half widths and half heights of the shapes:
        halfWidths = (shapeA.width / 2) + (shapeB.width / 2), 
        halfHeights = (shapeA.height / 2) + (shapeB.height / 2), 
        collisionDirection = null;

    // If the x and y distances are less than the half width or half height, they must be inside the object, causing a collision:
    if (Math.abs(distanceX) < halfWidths && Math.abs(distanceY) < halfHeights) { 
        // Figure out which side of shapeA shapeB is colliding with (top, bottom, left, or right):
        // Get offsets, or how far shapeA is inside shapeB (lower offset means closer to center):
        let offsetX = halfWidths - Math.abs(distanceX), 
            offsetY = halfHeights - Math.abs(distanceY);
        // If offsetX is greater than offsetY, collision must be at top or bottom of shapeA, since left or right would have been caught by now:
        if (offsetX >= offsetY) { 
            // A positive distance indicates collision is at the left or top side of shapeA:
            if (distanceY > 0) { 
                collisionDirection = "top"; 
                shapeA.y += offsetY; 
            } else { 
                collisionDirection = "bottom"; 
                shapeA.y -= offsetY; 
            } 
        } else { 
            if (distanceX > 0) { 
                collisionDirection = "left"; 
                shapeA.x += offsetX; 
            } else { 
                collisionDirection = "right"; 
                shapeA.x -= offsetX; } 
            } 
        } 
    applyCollision(shapeA, collisionDirection); 
}

let keys = [];
function update() {
    if (keys[38]) moveEntity(player, "up"); // up arrow
    if (keys[39]) moveEntity(player, "right"); // right arrow
    if (keys[37]) moveEntity(player, "left"); // left arrow
 
    // clear previous frame:
    ctx.clearRect(0, 0, game.width, game.height);
    // draw collisions:
    ctx.fillStyle = "black"; 
    ctx.beginPath();
    player.grounded = false;
    for (const item of collisions) {
        collisionCheck(player, item);
        ctx.rect(item.x, item.y, item.width, item.height); 
    }
    applyPhysics(player);
    ctx.fill();
    // draw the player:
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // run the loop each time:
    requestAnimFrame(update);
}

window.addEventListener("load", update());
document.addEventListener("keydown", e => {keys[e.keyCode] = true});
document.addEventListener("keyup", e => {keys[e.keyCode] = false});