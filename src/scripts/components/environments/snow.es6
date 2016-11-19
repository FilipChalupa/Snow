let Environment = require('./environment')
let Flake = require('../parts/flake')
let uniqId = require('../../utils/uniqId')
let exponentialRandom = require('../../utils/exponentialRandom')

module.exports = class Snow extends Environment {

	constructor(ctx, columns) {
		super(ctx, columns)

		this.flakes = []
		this.flakesRate = 60 // Per minut
		this.flakeAddTimeout = null

		this.columnsRandomQueue = []
		for (let i = this.columns.length-1; i >= 0; i--) {
			this.columnsRandomQueue[i] = i
		}

		if (this.columns.length) {
			this.addFlake()
		}
	}

	clearFlakeAddTimeout() {
		clearTimeout(this.flakeAddTimeout)
		this.flakeAddTimeout = null
	}

	getRandomColumnIndex() {
		let randomQueueIndex = Math.floor(exponentialRandom() * this.columnsRandomQueue.length)
		let columnIndex = this.columnsRandomQueue[randomQueueIndex]
		for (let i = randomQueueIndex; i < this.columnsRandomQueue.length-1; i++) {
			this.columnsRandomQueue[i] = this.columnsRandomQueue[i+1]
		}
		this.columnsRandomQueue[this.columnsRandomQueue.length-1] = columnIndex
		return columnIndex
	}

	addFlake() {
		this.flakes.push(
			new Flake(
				uniqId(),
				this.ctx,
				this.columns[this.getRandomColumnIndex()].getVertices(),
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
