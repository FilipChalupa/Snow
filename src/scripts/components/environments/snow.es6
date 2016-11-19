let Environment = require('./environment')
let Flake = require('../parts/flake')
let uniqId = require('../../utils/uniqId')
let ExponentialQueue = require('../../utils/exponentialQueue')

module.exports = class Snow extends Environment {

	constructor(ctx, columns, options) {
		super(ctx, columns, options)

		this.flakes = []
		this.timeout = null

		this.columnsRandomQueue = new ExponentialQueue(this.columns.length)

		if (this.columns.length) {
			this.addFlake()
		}
	}

	clearTimeout() {
		clearTimeout(this.timeout)
		this.timeout = null
	}

	addFlake() {
		this.flakes.push(
			new Flake(
				uniqId(),
				this.ctx,
				this.columns[this.columnsRandomQueue.getIndex()].getVertices(),
				this.options.speed,
				this.options.height,
				this.options.color,
				(e) => {this.flakeFinished(e)}
			)
		)

		this.timeout = setTimeout(() => {
			this.addFlake()
		}, 60000 / (this.options.rate) * (Math.random() * 0.4 + 0.8))
	}

	flakeFinished(flake) {
		this.removeFlake(flake.getId())
	}

	removeFlake(id) {
		let newFlakes = []
		for (let i = this.flakes.length-1; i >= 0; i--) {
			if (id !== this.flakes[i].getId()) {
				newFlakes.push(this.flakes[i])
			}
		}
		this.flakes = newFlakes
	}

	render() {
		this.flakes.forEach((flake) => {
			flake.render()
		})
	}

	destroy() {
		this.clearTimeout()
	}

}
