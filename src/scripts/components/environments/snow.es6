let Environment = require('./environment')
let Flake = require('../parts/flake')
let uniqId = require('../../utils/uniqId')
let ExponentialQueue = require('../../utils/exponentialQueue')

module.exports = class Snow extends Environment {

	constructor(ctx, columns) {
		super(ctx, columns)

		this.flakes = []
		this.flakesRate = 60 // Per minute
		this.flakeAddTimeout = null

		this.columnsRandomQueue = new ExponentialQueue(this.columns.length)

		if (this.columns.length) {
			this.addFlake()
		}
	}

	clearFlakeAddTimeout() {
		clearTimeout(this.flakeAddTimeout)
		this.flakeAddTimeout = null
	}

	addFlake() {
		this.flakes.push(
			new Flake(
				uniqId(),
				this.ctx,
				this.columns[this.columnsRandomQueue.getIndex()].getVertices(),
				20,
				10,
				[255,255,255],
				(e) => {this.flakeFinished(e)}
			)
		)

		this.flakeAddTimeout = setTimeout(() => {
			this.addFlake()
		}, 60000 / this.flakesRate)
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
		this.clearFlakeAddTimeout()
	}

}
