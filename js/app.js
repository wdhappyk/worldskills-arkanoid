class cacheImg {
	constructor(callback) {
		this.all = 0;
		this.loaded = 0;
		this.callback = callback;
	}
	add(...list) {
		for (let src of list) {
			this.all++;
			let img = new Image();
			img.src = src;
			img.onload = () => {
				this.loaded++;

				if (this.loaded == this.all) this.finish();
			};
		}

		return this;
	}
	finish() {
		this.callback();
	}
}

class Key {
	constructor(which, _callback = false) {
		this.press = false;
		this.keydown = (e) => {
			if (e.which != which) return;
			this.press = true;
			if (_callback) _callback();
		};
		this.keyup = (e) => {
			if (e.which != which) return;
			this.press = false;
			if (_callback) _callback();
		};

		document.addEventListener('keydown', this.keydown);
		document.addEventListener('keyup', this.keyup);
	}

	remove() {
		document.removeEventListener('keydown', this.keydown);
		document.removeEventListener('keyup', this.keyup);
	}
}

class Sprite {
	constructor(ctx, width, height, imgSrc) {
		this.ctx = ctx;
		this.width = width;
		this.height = height;
		this.hide = false;
		this.hOffset = 0;
		this.vOffset = 0;

		var img = new Image();
		img.src = imgSrc;

		this.img = img;
	}

	draw(x = 0, y = 0) {
		if (!this.img.complete || this.hide) return;
		this.ctx.drawImage(this.img, this.hOffset, this.vOffset, this.width, this.height, x >> 0, y >> 0, this.width, this.height);
	}

	changeImg(index) {
		if (!this.img.complete) return;

		index *= this.width;
		this.hOffset = index % this.img.width;
		this.vOffset = Math.floor(index / this.img.width) * this.height;
	}

	show() {
		this.hide = false;
	}
	hide() {
		this.hide = true;
	}
}

var sin = (() => {
	var db = Object.create(null);

	return a => {
		if (!db[a]) db[a] = Math.sin(a);

		return db[a];
	};
})();
var cos = (() => {
	var db = Object.create(null);

	return a => {
		if (!db[a]) db[a] = Math.cos(a);

		return db[a];
	};
})();

var radToDeg = a => 180 / Math.PI * a;
var degToRad = a => Math.PI / 180 * a;

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(v) {
		this.x += v.x;
		this.y += v.y;
	}

	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
	}

	negative() {
		this.x = -this.x;
		this.y = -this.y;
	}

	negativeX() {
		this.x = -this.x;
	}

	negativeY() {
		this.y = -this.y;
	}

	scale(scale) {
		this.x *= scale;
		this.y *= scale;
	}

	normalize() {
		var len = Math.sqrt(this.x * this.x + this.y * this.y);
		if (len) {
			this.x /= len;
			this.y /= len;
		}
		return len;
	}

	len() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	lenSquare() {
		return this.x * this.x + this.y * this.y;
	}

	rotate(angle) {
		angle = degToRad(angle);

		var vx = this.x,
			vy = this.y,
			cosVal = cos(angle),
			sinVal = sin(angle);
		this.x = vx * cosVal - vy * sinVal;
		this.y = vx * sinVal + vy * cosVal;
	}

	absRotate(angle) {
		angle = degToRad(90 - angle);

		var len = Math.sqrt(this.x * this.x + this.y * this.y),
			cosVal = cos(angle),
			sinVal = sin(angle);
		this.x = len * cosVal;
		this.y = -len * sinVal;
	}
}

class __Obj {
	/* spriteAnimate:
	 * @ list: number[] -- indexes images
	 * @ delay: number -- timer
	 */
	constructor(loc, spriteParams, spriteAnimate = false) {
		this.loc = loc;
		this.sprite = new Sprite(...spriteParams);
		this._animate = spriteAnimate;
		if (spriteAnimate) {
			this._animate._delay = 0;
			this._animate._index = 0;
		}
	}

	update() {
		if (this._animate) {
			if (this._animate._delay == this._animate.delay) {
				this._animate._delay = 0;
				this._animate._index++;
				if (this._animate._index == this._animate.list.length) this._animate._index = 0;
				this.sprite.changeImg(this._animate.list[this._animate._index]);
			}

			this._animate._delay++;
		}
	}

	render() {
		this.sprite.draw(this.loc.x, this.loc.y);
	}

	get x() {
		return this.loc.x;
	}
	get y() {
		return this.loc.y;
	}
	get width() {
		return this.sprite.width;
	}
	get height() {
		return this.sprite.height;
	}
}

class Block extends __Obj {
	/* params:
	 * @ steps: number
	 * @ speed: Vector
	 */
	constructor(loc, hp, params, spriteParams, spriteAnimate = false) {
		super(loc, spriteParams, spriteAnimate);
		this.hp = hp;
		this._params = params;
		this._step = 0;
	}

	update() {
		super.update();

		if (this._params) {
			if (this._step == this._params.steps) {
				this._step = 0;
				this._params.speed.negative();
			}

			this.loc.add(this._params.speed);
			this._step++;
		}
	}
}

class Obj extends Block {
	constructor(loc, hp, time, params, spriteParams, spriteAnimate = false) {
		super(loc, hp, params, spriteParams, spriteAnimate);
		this.time = time;
	}
}

class Board extends __Obj {
	constructor(loc, v, spriteParams, spriteAnimate = false) {
		super(loc, spriteParams, spriteAnimate);
		this.v = v;
	}
}

class Ball extends __Obj {
	constructor(loc, v, spriteParams, spriteAnimate = false) {
		super(loc, spriteParams, spriteAnimate);
		this.v = v;
	}

	update() {
		super.update();
		this.loc.add(this.v);
	}
}

class Stage {
	constructor(app) {
		this.app = app;
	}

	init() { }
	update() { }
	render() { }
}

class StartMenu extends Stage {
	constructor(app) {
		super(app);

		this.controller = {
			start: new Key(13)
		};

		var ctx = app.ctx;

		this.map = new Sprite(ctx, app.width, app.height, 'img/map.png');
	}

	init() {
		var box = document.getElementById('app-box');
		var name = document.createElement('input');
		name.setAttribute('placeholder', 'Введите ваше имя');

		box.append(name);

		var button = document.createElement('button');
		button.innerText = 'Начать игру';
		button.onclick = () => {
			this.controller.start.press = true;
		};

		box.append(button);

		this.name = name;
		this.button = button;

		this.app.ctx.fillStyle = '#00F';
		this.app.ctx.fillRect(0, 0, this.app.width, this.app.height);
	}

	update() {
		var app = this.app,
			key = this.controller;

		if (key.start.press) {
			var name = this.name,
				nv = name.value.trim();

			if (nv) {
				app.test = false;

				if (nv === 'terter') {
					nv = 'TeRTeR';
					app.test = true;
				}

				app.addStage('play', Play);
				app.setStage('play');

				this.app.db.name = nv;
				this.name.remove();
				this.button.remove();
			} else {
				name.focus();
				key.start.press = false;
			}
		}
	}

	render() {
		this.map.draw();
	}
}

class Play extends Stage {
	constructor(app) {
		super(app);

		var app = this.app,
			ctx = app.ctx;

		this.score = 0;
		this.hp = 3;
		this.timer = 150000;
		this._last = 0;

		this.map = new Sprite(ctx, app.width, app.height, 'img/map.png');
		this.board = new Board(new Vector(app.width / 2 - 30, app.height - 35), new Vector(5, 0), [ctx, 60, 15, 'img/board.png']);
		this.ball = new Ball(new Vector(app.width / 2 - 10, this.board.y - 20), new Vector(0, 10), [ctx, 20, 20, 'img/ball.png']);
		this.ball.v.rotate(randomInt(10, 100) / 100 * 45);
		this.blocks = [];
		this._objs = 0;

		var blocksMap = [
			'... +............. T...',
			'  ....v...xxx........  ',
			'     .........v...     ',
			' .      ... ...      . ',
			'... v      .   v    ...',
			' ...   |       |   ... ',
			'          ...          ',
			'   v    T  .     v     ',
			'   v    vvvv     vv v  ',
			'     v     v  v        ',
			'        >>>>>          ',
			' >>> >>                ',
			'           <<<+<<<     ',
			'               <<  <<< ',
		];

		var blocks = {
			'.': {
				block: 1,
				hp: 1,
				img: 'img/block.png',
				animate: false,
				params: false
			},
			'v': {
				block: 1,
				hp: 2,
				img: 'img/block2.png',
				animate: false,
				params: false
			},
			'x': {
				block: 1,
				hp: 5,
				img: 'img/block3.png',
				animate: {
					list: [0, 1, 2],
					delay: 40
				},
				params: false
			},
			'>': {
				block: 1,
				hp: 1,
				img: 'img/block.png',
				animate: false,
				params: {
					steps: 280,
					speed: [1, 1]
				}
			},
			'<': {
				block: 1,
				hp: 1,
				img: 'img/block.png',
				animate: false,
				params: {
					steps: 280,
					speed: [-1, 0]
				}
			},
			'|': {
				block: 1,
				hp: 1,
				img: 'img/block.png',
				animate: false,
				params: {
					steps: 60,
					speed: [0, 1]
				}
			},
			'+': {
				block: 0,
				hp: 1,
				time: 0,
				img: 'img/hp.png',
				animate: {
					list: [0, 1],
					delay: 40
				},
				params: false
			},
			'T': {
				block: 0,
				hp: 0,
				time: 15000,
				img: 'img/time.png',
				animate: false,
				params: false
			}
		};

		for (let y = 0; y < blocksMap.length; y++) {
			let line = blocksMap[y];

			for (let x = 0; x < line.length; x++) {
				if (line[x] == ' ') continue;
				let block = blocks[line[x]];

				if (block.block) {
					this.blocks.push(new Block(new Vector(x * 20, y * 20), block.hp, block.params && { steps: block.params.steps, speed: new Vector(...block.params.speed) }, [ctx, 20, 20, block.img], block.animate && Object.assign({}, block.animate)));
				} else {
					this._objs++;
					this.blocks.push(new Obj(new Vector(x * 20, y * 20), block.hp, block.time, block.params && { steps: block.params.steps, speed: new Vector(...block.params.speed) }, [ctx, 20, 20, block.img], block.animate && Object.assign({}, block.animate)));
				}
			}
		}

		this.controller = {
			space: new Key(32),
			left: new Key(37),
			right: new Key(39)
		};

		var pause = document.createElement('div');
		pause.id = 'pause';
		document.getElementById('app-box').append(pause);
	}

	init() {
		var app = this.app,
			ctx = app.ctx,
			key = this.controller;

		key.space.press = false;

		ctx.fillStyle = '#000';
		ctx.strokeStyle = '#F00';
		ctx.font = 'italic 20pt Arial';

		this._last = performance.now();

		var pause = document.getElementById('pause');
		pause.onclick = () => {
			key.space.press = true;
		};
	}

	update() {
		var app = this.app,
			test = app.test,
			key = this.controller,
			ball = this.ball,
			board = this.board,
			blocks = this.blocks;

		if (key.space.press) {
			app.setStage('pause');
			return;
		}

		if (!test) {
			if (this.timer > 0) {
				this.timer = Math.max(0, this.timer - (performance.now() - this._last));
				this._last = performance.now();
			} else {
				console.log(this.timer);
				app.db.score = this.score;
				app.setStage('end');
				return;
			}
		}

		ball.update();

		if (ball.y <= 0 || ball.y + ball.height >= app.height) {
			if (ball.y < 0) ball.loc.y = 0;
			else if (ball.y + ball.height > app.height) ball.loc.y = app.height - ball.height;

			if (ball.y + ball.height >= app.height && --this.hp == 0 && !test) {
				app.db.score = this.score;
				app.setStage('end');
				return;
			} else if (this.hp < 0) this.hp = 0;
			ball.v.negativeY();
		}

		for (let i = 0; i < blocks.length; i++) {
			let block = blocks[i];
			block.update();

			if (block.x + block.width - 3 < ball.x || block.x + 3 > ball.x + ball.x) continue;

			if (collize(ball, block)) {
				let pos = position(ball, block);

				if (Math.abs(pos.x) > 1) ball.v.negativeX();
				if (Math.abs(pos.y) > 1) ball.v.negativeY();

				if (--block.hp <= 0) blocks.splice(i, 1);

				if (block instanceof Obj) {
					if (pos.y != 0) ball.v.negativeY();
					this.hp += block.hp + 1;
					this.timer += block.time;
					this._objs--;
				} else this.score += 10;

				break;
			}
		}

		if (blocks.length - this._objs == 0) {
			app.db.score = this.score;
			app.setStage('end');
			return;
		}

		var ballOnBoard = collize(ball, board);

		if (key.left.press) {
			board.loc.sub(board.v);
			if (board.x < 0) board.loc.add(board.v);
			if (ballOnBoard) ball.loc.sub(board.v);
		}
		if (key.right.press) {
			board.loc.add(board.v);
			if (board.x + board.width > app.width) board.loc.sub(board.v);
			if (ballOnBoard) ball.loc.add(board.v);
		}

		if (ballOnBoard) {
			var pos = position(ball, board);
			if (pos.y <= 0) {
				ball.v.absRotate(pos.x * 45);
			}
		}

		if (ball.x <= 0 || ball.x + ball.width >= app.width) {
			if (ball.x < 0) ball.loc.x = 0;
			else if (ball.x + ball.width > app.width) ball.loc.x = app.width - ball.height;
			ball.v.negativeX();
		}
	}

	render() {
		var app = this.app,
			ctx = app.ctx;

		this.map.draw();

		for (let block of this.blocks)
			block.render();

		this.ball.render();
		this.board.render();

		var fsec = this.timer / 1000,
			min = Math.floor(fsec / 60),
			sec = Math.floor(fsec - 60 * min);

		if (min < 10) min = '0' + min;
		if (sec < 10) sec = '0' + sec;

		ctx.fillText(app.db.name, 20, app.height - 80);
		ctx.fillText(min + ':' + sec, app.width - 110, app.height - 80);
		ctx.strokeText('Score: ' + this.score, 20, app.height - 30);
		ctx.strokeText('HP: ' + this.hp, 380, app.height - 30);
	}
}

class Pause extends Stage {
	constructor(app) {
		super(app);

		this.controller = {
			space: new Key(32)
		};
	}

	init() {
		var app = this.app,
			ctx = app.ctx,
			key = this.controller;

		key.space.press = false;

		ctx.fillStyle = '#000';
		ctx.font = 'normal 20px Arial';
		ctx.fillText('Чтобы продолжить игру нажмите "Пробел"', 20, 300);

		var pause = document.getElementById('pause');
		pause.onclick = () => {
			key.space.press = true;
		};
	}

	update() {
		var app = this.app,
			key = this.controller;


		if (key.space.press) app.setStage('play');
	}
}

class End extends Stage {
	constructor(app) {
		super(app);

		this.controller = {
			start: {
				press: false
			}
		};

		var ctx = app.ctx;

		this.map = new Sprite(ctx, app.width, app.height, 'img/map.png');
	}

	init() {
		var app = this.app,
			ctx = app.ctx;

		this.controller.start.press = false;

		ctx.fillStyle = '#000';
		ctx.font = 'normal 20px Arial';

		document.getElementById('pause').remove();

		var play = document.createElement('button');
		play.innerText = 'Новая игра';
		play.onclick = () => {
			this.controller.start.press = true;
		};

		var appBox = document.getElementById('app-box');

		appBox.append(play);

		this.play = play;

		var form = document.createElement('div');
		this.form = form;
		form.id = 'form';
		form.innerText = 'Таблица рекордов';
		var list = document.createElement('ol');
		form.append(list);
		appBox.append(form);


		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'results.php', true);
		xhr.send(JSON.stringify({'score': app.db.score, 'name': app.db.name}));

		xhr.onreadystatechange = () => {
			if (xhr.readyState != 4 || xhr.status != 200) {
				// что-то пошло не так
				return;
			}
			// запрос прошел успешно
			var data = JSON.parse(xhr.responseText);
			var top = false;

			for (let i = 0; i < data.length; i++) {
				let r = data[i];

				if (r['name'] == app.db.name) top = true;
				if (i == data.length - 1 && !top) {
					r = {'score': app.db.score, 'name': app.db.name};
				}

				let li = document.createElement('li');
				li.innerText = r['name'] + ' - ' + r['score'];
				list.append(li);
			}
		};
	}

	update() {
		var app = this.app,
			key = this.controller;

		if (key.start.press) {
			this.form.remove();
			this.play.remove();
			app.addStage('play', Play);
			app.setStage('play');
		}
	}

	render() {
		var app = this.app,
			ctx = app.ctx;

		this.map.draw();
		ctx.fillText('Игра окончена. Результат: ' + app.db.score, 5, 90);
	}
}

class Load extends Stage {
	constructor(app) {
		super(app);

		var ctx = app.ctx;

		(new cacheImg(function main() {
			app.setStage('menu');
		})).add(
			'img/map.png',
			'img/board.png',
			'img/ball.png',
			'img/block.png',
			'img/block2.png',
			'img/block3.png',
			'img/time.png',
			'img/hp.png',
			'img/pause.png'
			);

		ctx.fillStyle = '#00F';
		ctx.strokeStyle = '#000';
		ctx.font = 'italic 30px Arial';
		ctx.fillRect(0, 0, app.width, app.height);
		ctx.strokeText('Загрузка...', 130, 300);
	}
}

class App {
	constructor() {
		var canvas = document.getElementById('app');
		var ctx = canvas.getContext('2d');

		this.width = 460;
		this.height = 660;

		canvas.width = this.width;
		canvas.height = this.height;

		this.canvas = canvas;
		this.ctx = ctx;
		this.ctx.save();

		this.stages = {
			'load': new Load(this),
			'menu': new StartMenu(this),
			'pause': new Pause(this),
			'end': new End(this)
		};
		this.setStage('load');
		this.test = false;

		this.db = {};

		var last = performance.now(),
			now,
			step = 1 / 60,
			dt = 0;

		var frame = () => {
			now = performance.now();

			dt += Math.min(1, (now - last) / 1000);

			while (dt > step) {
				dt -= step;
				this.stage.update();
			}

			last = now;
			this.stage.render();

			requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	}

	setStage(name) {
		if (this.stages[name]) {
			this.ctx.restore();
			this.ctx.save();
			this.stage = this.stages[name];
			this.stage.init();
		}
	}

	addStage(name, obj) {
		this.stages[name] = new obj(this);
	}
}

function collize(a, b) {
	if (a.x + a.width >= b.x && a.x <= b.x + b.width && a.y + a.height >= b.y && a.y <= b.y + b.height) return true;

	return false;
}

function position(a, b) {
	var paw = a.width / 2,
		pbw = b.width / 2,
		pah = a.height / 2,
		pbh = b.height / 2,

		pawl = a.x + paw,
		pbwl = b.x + pbw,
		pahl = a.y + pah,
		pbhl = b.y + pbh,

		x = (pawl - pbwl) / pbw,
		y = (pahl - pbhl) / pbh;

	return { x, y };
}

function positionSquare(a, b) {
	var x = y = 0,
		caw = a.x + a.width / 2,
		cbw = b.x + b.width / 2,
		cah = a.y + a.height / 2,
		cbh = b.y + b.height / 2;

	if (caw > cbw) x = 1;
	else if (caw < cbw) x = -1;

	if (cah > cbh) y = 1;
	else if (cah < cbh) y = -1;

	return { x, y };
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//main
new App;