

class ImageSprite {
	constructor(x,y,w,h,clr) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.clr = clr;
	}
	draw(ctx) {
		ctx.fillStyle = this.clr;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

const Tiles = {
	UNDEFINED: -1,
	EMPTY: 0,
	FILLED: 1,
	BUILDING: 2
};

class Board {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		var tiles = [];
		for(var i = 0; i < this.height; i++) {
			tiles.push([]);
			for(var j = 0; j < this.width; j++) {
				var z = i < 2 || i > this.height - 3 || j < 2 || j > this.width - 3;
				if(!z) tiles[i].push(0);
				else tiles[i].push(1);
			}
		}
		this.tiles = tiles;
	}
	draw(ctx) {
		for(var y = 0; y < this.height; y++) {
			for(var x = 0; x < this.width; x++) {
				if(this.tiles[y][x] == Tiles.FILLED) {
					ctx.fillStyle = "#3355AA";
					ctx.fillRect(x+0.05,y+0.05,0.9,0.9);
				}
				else if(this.tiles[y][x] == Tiles.BUILDING) {
					ctx.fillStyle = "#4488BB";
					ctx.fillRect(x+0.05,y+0.05,0.9,0.9);
				}
			}
		}
	}
	getTile(x,y) {
		x = Math.floor(x);
		y = Math.floor(y);
		if(x < 0 || x >= this.width || y < 0 || y >= this.height)
			return Tiles.UNDEFINED;
		return this.tiles[y][x];
	}
	setTile(x,y,t) {
		x = Math.floor(x);
		y = Math.floor(y);
		if(x < 0 || x >= this.width || y < 0 || y >= this.height)
			return;
		this.tiles[y][x] = t;
	}
}

class Animation {
	constructor(count) {
		this.startCount = count;
		this.count = count;
	}
	tick() {
		this.count = this.count - 1;
	}
}

const Directions = {
	LEFT: 0,
	RIGHT: 1,
	UP: 2,
	DOWN: 3
};

class Player {
	constructor(level) {
		this.level = level;
		this.x = 0;
		this.y = 0;
		this.sprite = new ImageSprite(this.x + 0.1,this.y + 0.1,0.8,0.8,"#FF0000");
		this.animation = null;
		this.dir = null;
		this.lives = 1;
	}
	move(d) {
		if(this.animation == null) {
			this.dir = d;
			if(d == Directions.LEFT && this.x == 0)
				return;
			if(d == Directions.RIGHT && this.x == this.level.board.width - 1)
				return;
			if(d == Directions.UP && this.y == 0)
				return;
			if(d == Directions.DOWN && this.y == this.level.board.height - 1)
				return;
			this.animation = new Animation(5);
		}
	}
	takeDamage() {
		this.lives--;
		if(this.lives <= 0) {
			this.level.gameOver();
		}
		this.x = 0;
		this.y = 0;
		this.level.clearBuilds();
		this.animation = null;
	}
	tick() {
		if(this.animation != null) {
			this.animation.tick();
			switch(this.dir) {
			case Directions.LEFT:
				this.x = this.x - 1/this.animation.startCount;
				break;
			case Directions.RIGHT:
				this.x = this.x + 1/this.animation.startCount;
				break;
			case Directions.UP:
				this.y = this.y - 1/this.animation.startCount;
				break;
			case Directions.DOWN:
				this.y = this.y + 1/this.animation.startCount;
				break;
			default:
				break;
			}
			if(this.animation.count <= 0) {
				this.x = Math.round(this.x);
				this.y = Math.round(this.y);
				if(this.level.board.getTile(this.x, this.y) != Tiles.FILLED) {
					this.animation.count = this.animation.startCount;
				}
				else {
					this.animation = null;
					this.level.fillVoids();
				}
			}
		}
		if(this.level.board.getTile(Math.round(this.x), Math.round(this.y)) == Tiles.EMPTY) {
			this.level.board.setTile(Math.round(this.x), Math.round(this.y), Tiles.BUILDING);
		}
		this.sprite.x = this.x + 0.1;
		this.sprite.y = this.y + 0.1;
	}
}

class Monster {
	constructor(level) {
		this.level = level;
		this.x = 5.5;
		this.y = 5.5;
		this.vx = 0.2;
		this.vy = 0.2;
		this.sprite = new ImageSprite(this.x-0.5,this.y-0.5,1,1,"#00FF00");
	}
	tick() {
		this.x += this.vx;
		this.y += this.vy;
		this.sprite.x = this.x - 0.5;
		this.sprite.y = this.y - 0.5;
		var cx = Math.floor(this.x);
		var cy = Math.floor(this.y);
		var nx, ny;
		if(this.vx > 0) {
			nx = Math.floor(this.x+0.5);
		}
		else {
			nx = Math.floor(this.x-0.5);
		}
		if(this.vy > 0) {
			ny = Math.floor(this.y+0.5);
		}
		else {
			ny = Math.floor(this.y-0.5);
		}
		if(this.level.board.getTile(nx, cy) != Tiles.EMPTY) {
			this.vx = -this.vx;
			if(this.level.board.getTile(nx, cy) == Tiles.BUILDING) {
				this.level.player.takeDamage();
			}
		}
		if(this.level.board.getTile(cx, ny) != Tiles.EMPTY) {
			this.vy = -this.vy;
			if(this.level.board.getTile(cx, ny) == Tiles.BUILDING) {
				this.level.player.takeDamage();
			}
		}
	}
}

const GameState = {
	PLAYING: 1,
	GAME_OVER: 2
};

class Level {
	constructor() {
		this.board = new Board(30,20);
		this.player = new Player(this);
		this.monsters = [];
		this.monsters.push(new Monster(this));
		this.state = GameState.PLAYING;
	}
	get sprites() {
		var s = [];
		s.push(this.board);
		s.push(this.player.sprite);
		this.monsters.forEach(m => s.push(m.sprite));
		return s;
	}
	mark(x,y,check) {
		if(this.board.getTile(x,y) != Tiles.EMPTY || check[y][x] == true) {
			return;
		}
		check[y][x] = true;
		this.mark(x-1,y,check);
		this.mark(x,y-1,check);
		this.mark(x+1,y,check);
		this.mark(x,y+1,check);
	}
	fillVoids() {
		var check = [];
		for(var i = 0; i < this.board.height; i++) {
			check.push([]);
			for(var j = 0; j < this.board.width; j++) {
				check[i].push(false);
			}
		}
		this.monsters.forEach(m => this.mark(Math.floor(m.x), Math.floor(m.y), check));
		for(var i = 0; i < this.board.height; i++) {
			for(var j = 0; j < this.board.width; j++) {
				if(!check[i][j]) {
					this.board.setTile(j,i,Tiles.FILLED);
				}
			}
		}
	}
	clearBuilds() {
		for(var i = 0; i < this.board.height; i++) {
			for(var j = 0; j < this.board.width; j++) {
				if(this.board.getTile(j,i) == Tiles.BUILDING) {
					this.board.setTile(j,i,Tiles.EMPTY);
				}
			}
		}
	}
	gameOver() {
		this.state = GameState.GAME_OVER;
	}
	tick() {
		this.player.tick();
		this.monsters.forEach(m => m.tick());
	}
}