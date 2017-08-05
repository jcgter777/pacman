function init() {
	var canvas = document.getElementById('root');
	const COLOR_BACKGROUND = "#000000";
	const COLOR_PACMAN = "#990000";
	const COLOR_POWER = "#ff0000"
	const COLOR_GHOST = "#993333";
	const COLOR_MAP = "#000099";
	const COLOR_FOOD = "#999999";
	const COLOR_CHERRY = "#ffffff";
	const MARGIN_PACMAN = 1;
	const STEP = 5;
	const GRID_SIZE = 19;
	const ROW_NUMBER = GRID_SIZE * STEP;
	const FOOD = "food";
	const BLOCK = "block";
	const PACMAN_X = "x";
	const PACMAN_Y = "y";
	const NUMBER_GHOSTS = 3;
	const NUMBER_CHERRY = 5;
	const INTERVAL = 100;
	const TIME_POWER = INTERVAL * 50;

	var ctx = canvas.getContext("2d");
	var w = window.innerWidth;
	var h = window.innerHeight;
	canvas.width = w > h ? h : w;
	canvas.height = canvas.width;
	w = canvas.width;
	var cw = w / ROW_NUMBER;
	const SIZE_BLOCK = w / GRID_SIZE;
	var pacman = {};
	var map = [];
	var food = [];
	var ghosts = [];
	var cherries = [];
	var isOpen = false;
	const GHOST_AREA = { x: 7, y: 8, w: 5, h: 3 };
	const DIRECTION = { l: "left", r: "right", u: "up", d: "down" };
	var score = 0;

	reset();
	setInterval(updateFrame, INTERVAL);
	//updateFrame();
	function updateFrame() {
		drawBackground();
		updateMap();
		updateFood();
		updateCherries();
		updatePacman();
		updateGhosts();
		updateScore();
		//console.log(pacman.x + " " + pacman.y);
	}
	function reset() {
		toDefault();
		initialize();
		function toDefault() {
			map = [];
			food = [];
			ghosts = [];
			cherries = [];
			pacman = { x: 1, y: 1, direction: "right", power: 0 };
		}
	}
	function initialize() {
		generateMap();
		generateFood();
		generateCherry();
		generateGhosts();
	}
	function randomProperty(obj) {
		var keys = Object.keys(obj)
		return obj[keys[keys.length * Math.random() << 0]];
	};
	function generateGhosts() {
		for (let i = 0; i < NUMBER_GHOSTS; i++) {
			let x = Math.floor(Math.random() * GHOST_AREA.w) + GHOST_AREA.x;
			let y = Math.floor(Math.random() * GHOST_AREA.h) + GHOST_AREA.y;
			let direction = randomProperty(DIRECTION);
			console.log("x: " + x + " y: " + y + " direction: " + direction);
			ghosts.push({ x: x, y: y, direction: direction });
		}
	}
	function generateCherry() {
		for (let i = 0; i < NUMBER_CHERRY; i++) {
			let cher = food[Math.floor(Math.random() * food.length)];
			if (!cherries.some(value => (value.x == cher.x && value.y == cher.y)))
				cherries.push({ x: cher.x, y: cher.y });
			else
				i--;
		}
	}
	function updateCherries() {
		drawCherries();
		function drawCherries() {
			ctx.fillStyle = COLOR_CHERRY;
			cherries.forEach(cherry => {
				ctx.fillRect(cherry.x * SIZE_BLOCK, cherry.y * SIZE_BLOCK, SIZE_BLOCK, SIZE_BLOCK);
			});
		}
	}
	function updateGhosts() {
		controlGhosts();
		drawGhosts();
	}
	function drawGhosts() {
		ghosts.forEach(value => {
			drawGhost(value);
		})
	}
	function drawGhost(value) {
		ctx.fillStyle = COLOR_GHOST;
		//console.log(value);
		ctx.fillRect(value.x * SIZE_BLOCK, value.y * SIZE_BLOCK, SIZE_BLOCK, SIZE_BLOCK);
	}
	function controlGhosts() {
		ghosts.forEach(value => {
			controlObject(value, true);
		})
	}
	function generateFood() {
		for (let i = 0; i < GRID_SIZE; i++) {
			for (let j = 0; j < GRID_SIZE; j++) {
				if (!map.some(value => (
					value.x == i && value.y == j))) {
					food.push({ x: i, y: j });
				}
			}
		}
	}

	function updateFood() {
		drawFood();
	}
	function updateMap() {
		drawMap();
	}
	function updatePacman() {
		controlObject(pacman, false);
		drawPacman();
	}
	function updateScore() {
		controlScore();
		drawScore();
		function controlScore() {
			//pacman eats food
			food.forEach((value, i) => {
				let x = Math.round(pacman.x);
				let y = Math.round(pacman.y);
				if (x == value.x && y == value.y) {
					score++;
					food.splice(i, 1);
				}
			});

			//pacman crashes ghost
			ghosts.forEach((value, index) => {
				if (Math.ceil(value.x) == Math.ceil(pacman.x) && Math.ceil(value.y) == Math.ceil(pacman.y) || Math.floor(value.x) == Math.floor(pacman.x) && Math.floor(value.y) == Math.floor(pacman.y)) {
					if (pacman.power < 0) {
						reset();
						score = 0;
						console.log("game over");
					} else {
						ghosts.splice(index, 1);
						score += 10;
					}
				}
			});

			//pacman eats cherry
			cherries.forEach((cherry, index) => {
				if (cherry.x == pacman.x && cherry.y == pacman.y) {
					pacman.power = TIME_POWER;
					cherries.splice(index, 1);
					score += 5;
				}
			});
		}
		function drawScore() {
			ctx.fillStyle = COLOR_FOOD;
			ctx.font = "20px Monaco";
			ctx.fillText("Score: " + score, 0, cw * 3);
		}
	}

	function controlObject(obj, isGhost) {
		let possibleDirection = [];
		let index = 0;
		Object.keys(DIRECTION).forEach(key => {
			if (whereCantGo().indexOf(DIRECTION[key]) == -1)
				possibleDirection.push(DIRECTION[key]);
		});
		if (isPossible(obj.direction)) {
			if ((index = possibleDirection.indexOf(opositeOf(obj.direction))) != -1)
				possibleDirection.splice(index, 1);
		}
		if (isGhost && Number.isInteger(obj.x) && Number.isInteger(obj.y)) {
			console.log(possibleDirection.length)
			obj.direction = possibleDirection[Math.floor(Math.random() * possibleDirection.length)];
		}
		if (!isGhost) {
			obj.power -= INTERVAL;
			isOpen = !isOpen;
		}
		function opositeOf(x) {
			switch (x) {
				case DIRECTION.l:
					return DIRECTION.r;
				case DIRECTION.r:
					return DIRECTION.l;
				case DIRECTION.u:
					return DIRECTION.d;
				case DIRECTION.d:
					return DIRECTION.u;
			}
		}
		function isPossible(x) {
			return possibleDirection.indexOf(x) == -1 ? false : true;
		}

		switch (obj.direction) {
			case DIRECTION.r:
				if (isPossible(DIRECTION.r)) {
					obj.x += 1 / 4;
					obj.y = Math.round(obj.y);
				}
				break;
			case DIRECTION.l:
				if (isPossible(DIRECTION.l)) {
					obj.x -= 1 / 4;
					obj.y = Math.round(obj.y);
				}
				break;
			case DIRECTION.u:
				if (isPossible(DIRECTION.u)) {
					obj.y -= 1 / 4;
					obj.x = Math.round(obj.x);
				}
				break;
			case DIRECTION.d:
				if (isPossible(DIRECTION.d)) {
					obj.y += 1 / 4;
					obj.x = Math.round(obj.x);
				}
				break;
		}
		function whereCantGo() {
			let direction = [];
			if (isCrashed(obj.x + 1, obj.y))
				direction.push(DIRECTION.r);
			if (isCrashed(obj.x - 1, obj.y))
				direction.push(DIRECTION.l);
			if (isCrashed(obj.x, obj.y - 1))
				direction.push(DIRECTION.u);
			if (isCrashed(obj.x, obj.y + 1))
				direction.push(DIRECTION.d);
			//console.log("where cant go: " + direction.length);
			return direction;
		}
		function isCrashed(x, y) {
			return map.some(value => (value.x == x && value.y == y));
		}
	}
	function drawPacman() {
		let color = pacman.power < 0 ? COLOR_PACMAN : COLOR_POWER;
		let margin = pacman.power < 0 ? MARGIN_PACMAN : -MARGIN_PACMAN;
		let angle = isOpen ? getAngle() : { startMouth: 0, endMouth: Math.PI, startHead: Math.PI, endHead: 0 };
		let eye = getEye();

		ctx.beginPath();
		ctx.arc(pacman.x * SIZE_BLOCK + SIZE_BLOCK / 2 + margin, pacman.y * SIZE_BLOCK + SIZE_BLOCK / 2 + margin, SIZE_BLOCK / 2 - margin * 2, angle.startMouth, angle.endMouth, false);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.beginPath();
		ctx.arc(pacman.x * SIZE_BLOCK + SIZE_BLOCK / 2 + margin, pacman.y * SIZE_BLOCK + SIZE_BLOCK / 2 + margin, SIZE_BLOCK / 2 - margin * 2, angle.startHead, angle.endHead, false);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(eye.x, eye.y, SIZE_BLOCK / 10, 0, 2 * Math.PI, false);
		ctx.fillStyle = COLOR_FOOD;
		ctx.fill();

		function getEye() {
			let eye = {};
			const base = { x: pacman.x * SIZE_BLOCK, y: pacman.y * SIZE_BLOCK };
			switch (pacman.direction) {
				case DIRECTION.r:
				case DIRECTION.l:
					eye.x = base.x + SIZE_BLOCK / 2;
					eye.y = base.y + SIZE_BLOCK / 4;
					break;
				case DIRECTION.u:
					eye.x = base.x + SIZE_BLOCK / 4;
					eye.y = base.y + SIZE_BLOCK / 2;
					break;
				case DIRECTION.d:
					eye.x = base.x + SIZE_BLOCK * 3 / 4;
					eye.y = base.y + SIZE_BLOCK / 2;
					break;
			}
			return eye;
		}
		function getAngle() {
			let angle = { startMouth: Math.PI, endMouth: Math.PI, startHead: Math.PI, endHead: Math.PI };
			let mouth = 0, head = 0;
			switch (pacman.direction) {
				case DIRECTION.r:
					mouth = 0.25;
					head = 0.75
					break;
				case DIRECTION.l:
					mouth = 1.75;
					head = 1.25
					break;
				case DIRECTION.u:
					mouth = 0.25;
					head = 1.75;
					break;
				case DIRECTION.d:
					mouth = 0.75;
					head = 1.25;
					break;
			}
			angle.startMouth *= mouth;
			angle.endMouth *= mouth > 1 ? mouth - 1 : mouth + 1;
			angle.startHead *= head;
			angle.endHead *= head > 1 ? head - 1 : head + 1;
			return angle;
		}
	}

	function generateMap() {
		for (let i = 0; i < GRID_SIZE / 2; i++) {
			generateOthers(i, 0);
		}
		for (let i = 1; i < GRID_SIZE / 2; i++) {
			generateOthers(0, i);
		}
		for (let i = 2; i < 2 + 5; i++) {
			generateOthers(2, i);
		}
		for (let i = 4; i < 4 + 5; i++) {
			generateOthers(i, 2);
		}
		for (let i = 2; i < 2 + 3; i++) {
			generateOthers(i, 8);
		}
		for (let i = 4; i < 9; i += 2) {
			for (let j = 4; j < 4 + 2; j++) {
				generateOthers(i, j);
			}
		}
		generateOthers(4, 7);
		generateOthers(7, 7);
		generateOthers(6, 7);
		generateOthers(6, 8);
		pushIntoMap({ x: 6, y: 9 });
		pushIntoMap({ x: GRID_SIZE - 6 - 1, y: 9 });
		//pushIntoMap({ x: 9, y: 7 });
		for (let i = 8; i < 8 + 3; i++) {
			pushIntoMap({ x: i, y: 11 });
		}
		function generateOthers(x, y) {
			pushIntoMap({ x: x, y: y });
			pushIntoMap({ x: GRID_SIZE - x - 1, y: y });
			pushIntoMap({ x: x, y: GRID_SIZE - y - 1 });
			pushIntoMap({ x: GRID_SIZE - x - 1, y: GRID_SIZE - y - 1 });
		}
		function pushIntoMap(value) {
			//for (let i = value.x; i <= value.x + 2; i++) {
			//for (let j = value.y; j <= value.y + 2; j++) {
			map.push({ x: value.x, y: value.y });
			//console.log("putted: " + value.x + " " + value.y);
			//}
			//}
		}
	}

	function drawFood() {
		food.forEach(value => {
			drawElement(FOOD, value.x, value.y);
		});
	}

	function drawBackground() {
		ctx.fillStyle = COLOR_BACKGROUND;
		ctx.fillRect(0, 0, w, h);
	}

	function drawMap() {
		map.forEach(value => {
			drawElement(BLOCK, value.x, value.y);
		});
	}
	function drawElement(ele, x, y) {
		switch (ele) {
			case BLOCK:
				ctx.fillStyle = COLOR_MAP;
				ctx.fillRect(x * SIZE_BLOCK, y * SIZE_BLOCK, SIZE_BLOCK, SIZE_BLOCK);
				break;
			case FOOD:
				ctx.fillStyle = COLOR_FOOD;
				ctx.fillRect(x * SIZE_BLOCK + SIZE_BLOCK / 3, y * SIZE_BLOCK + SIZE_BLOCK / 3, SIZE_BLOCK / 3, SIZE_BLOCK / 3);
				break;

		}
	}

	document.onkeydown = function (e) {
		switch (e.keyCode) {
			case 37:
				pacman.direction = DIRECTION.l;
				pacman.y = Math.round(pacman.y);
				break;
			case 38:
				pacman.direction = DIRECTION.u;
				pacman.x = Math.round(pacman.x);
				break;
			case 39:
				pacman.direction = DIRECTION.r;
				pacman.y = Math.round(pacman.y);
				break;
			case 40:
				pacman.direction = DIRECTION.d;
				pacman.x = Math.round(pacman.x);
			case 32:
				console.log("space pressed");

				break;
		}
	};
}

init();