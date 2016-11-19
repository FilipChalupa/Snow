let exponentialRandom = require('./exponentialRandom')
let shuffleArray = require('./shuffleArray')

module.exports = class {

	constructor(size) {
		this.size = size
		this.queue = []
		for (let i = size-1; i >= 0; i--) {
			this.queue[i] = i
		}
		shuffleArray(this.queue)
	}

	getIndex() {
		let randomQueueIndex = Math.floor(exponentialRandom() * this.size)
		let targetIndex = this.queue[randomQueueIndex]
		for (let i = randomQueueIndex; i < this.size-1; i++) {
			this.queue[i] = this.queue[i+1]
		}
		this.queue[this.size-1] = targetIndex
		return targetIndex
	}

}
