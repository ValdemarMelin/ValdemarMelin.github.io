
var canvas, ctx;

var boardWidth = 30;
var boardHeight = 20;

function drawBoard() {
	var tileSize = Math.min(canvas.width/boardWidth, canvas.height/boardHeight);
	var x0 = (canvas.width - boardWidth*tileSize)/2;
	var y0 = (canvas.height - boardHeight*tileSize)/2;
	ctx.fillStyle = "#3355AA";
	for(i = 0; i < boardWidth; i++) {
		for(j = 0; j < boardHeight; j++) {
			ctx.fillRect(x0 + tileSize*(i-0.05),y0 + tileSize*(j-0.05),tileSize*0.9,tileSize*0.9);
		}
	}
}

function tick() {
	canvas.width = canvas.getBoundingClientRect().width;
	canvas.height = canvas.getBoundingClientRect().height;
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawBoard();
}

window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	setInterval(tick, 50);
}