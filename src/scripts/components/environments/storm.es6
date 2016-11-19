let Environment = require('./environment')
let Flash = require('../parts/flash')
let ExponentialQueue = require('../../utils/exponentialQueue')

module.exports = class Storm extends Environment {

	constructor(ctx, columns, options) {
		super(ctx, columns, options)

		this.timeout = null

		this.flashes = []
		for (let i = columns.length-1; i >= 0; i--) {
			this.flashes[i] = new Flash(this.ctx, this.columns[i].getVertices(), this.options.color, () => {})
		}

		this.flashesRandomQueue = new ExponentialQueue(this.flashes.length)

		if (this.columns.length > 0) {
			this.flash()
		}
	}

	clearTimeout() {
		clearTimeout(this.timeout)
		this.timeout = null
	}

	flash() {
		this.flashes[this.flashesRandomQueue.getIndex()].flash()

		this.timeout = setTimeout(() => {
			this.flash()
		}, 60000 / (this.options.rate) * (Math.random() * 0.8 + 0.4))
	}

	render() {
		this.flashes.forEach((flash) => {
			flash.render()
		})
	}

	destroy() {
		this.clearTimeout()
	}

}
