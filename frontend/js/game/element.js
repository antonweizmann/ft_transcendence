export class Element {
	constructor(options) {
		this._x = options.x;
		this._y = options.y;
		this._height = options.height;
		this._width = options.width;
		this._speed = options.speed;
		this.dirX = options.dirX;
		this.dirY = options.dirY;
		this.color = options.color;
		this._maxY = options.maxY;
		this._maxX = options.maxX
	}

	get x() { return typeof this._x === 'function' ? this._x() : this._x; }
	set x(value) {
		const maxXValue = typeof this.maxX === 'function' ? this.maxX() : this.maxX;
		this._x = Math.min(maxXValue, Math.max(0, value));
	}
	get y() { return typeof this._y === 'function' ? this._y() : this._y; }
	set y(value) {
		const maxYValue = typeof this.maxY === 'function' ? this.maxY() : this.maxY;
		this._y = Math.min(maxYValue, Math.max(0, value));
	}

	get width() { return typeof this._width === 'function' ? this._width() : this._width; }
	get height() { return typeof this._height === 'function' ? this._height() : this._height; }
	get maxX() { return typeof this._maxX === 'function' ? this._maxX() : this._maxX; }
	get maxY() { return typeof this._maxY === 'function' ? this._maxY() : this._maxY; }
	get speed() { return typeof this._speed === 'function' ? this._speed() : this._speed; }
	set speed(value) {this._speed = value};
}
