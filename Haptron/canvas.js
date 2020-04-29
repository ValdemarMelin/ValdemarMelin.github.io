
var canvas, ctx;

var boardWidth = 30;
var boardHeight = 20;

var level = null;

var keys = {
	left: false,
	right: false,
	top: false,
	down: false
};

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "30px Arial";
	ctx.fillText("Lives: " + level.player.lives, 10, 50); 
	var tileSize = Math.min(canvas.width/boardWidth, canvas.height/boardHeight);
	var x0 = (canvas.width - boardWidth*tileSize)/2;
	var y0 = (canvas.height - boardHeight*tileSize)/2;
	ctx.fillStyle = "#3355AA";
	ctx.translate(x0,y0);
	ctx.scale(tileSize, tileSize);
	level.sprites.forEach(s => s.draw(ctx));
	ctx.scale(1/tileSize, 1/tileSize);
	ctx.translate(-x0,-y0);
	if(level.state == GameState.GAME_OVER) {
		ctx.fillStyle = "#FF3333";
		ctx.font = "80px Arial";
		ctx.fillText("Game Over", canvas.width/2 - 200, canvas.height/2 - 40);
		ctx.font = "30px Arial";
		ctx.fillText("Press space to restart", canvas.width/2 - 150, canvas.height/2 + 40);
	}
}

function tick() {
	if(level == null) {
		level = new Level();
	}
	if(level.state == GameState.PLAYING) {
		if(keys.left) {
			level.player.move(Directions.LEFT);
		}
		else if (keys.right) {
			level.player.move(Directions.RIGHT);
		}
		else if (keys.up) {
			level.player.move(Directions.UP);
		}
		else if (keys.down) {
			level.player.move(Directions.DOWN);
		}
		level.tick();
	}
	draw();
}

function keydown(e) {
	switch(e.keyCode) {
	case 32:
		if(level.state == GameState.GAME_OVER) {
			level = null;
		}
		break;
	case 37:
		keys.left = true;
		break;
	case 38:
		keys.up = true;
		break;
	case 39:
		keys.right = true;
		break;
	case 40:
		keys.down = true;
		level.player.move(Directions.DOWN);
		break;
	default:
		break;
	}
}

function keyup(e) {
	switch(e.keyCode) {
	case 37:
		keys.left = false;
		break;
	case 38:
		keys.up = false;
		break;
	case 39:
		keys.right = false;
		break;
	case 40:
		keys.down = false;
		break;
	default:
		break;
	}
}

window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	setInterval(tick, 50);
	window.addEventListener('keydown',function(e) {keydown(e);}, false);
	window.addEventListener('keyup',keyup, false);
	setTimeout(function () {
		const canvasW = canvas.getBoundingClientRect().width;
		const canvasH = canvas.getBoundingClientRect().height;
		canvas.width = canvasW;
		canvas.height = canvasH;
	}, 200);
}