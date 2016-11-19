let distance = require('../../utils/distance')

module.exports = class Flake {

	constructor(id, ctx, columnVertices, speed, length, color, finishedCallback) {
		this.id = id
		this.ctx = ctx
		this.vertices = columnVertices
		this.speed = speed
		this.length = length
		this.color = color
		this.finishedCallback = finishedCallback
		this.startTime = Date.now()

		this.finished = false

		this.topMid = this.getMidPoint(this.vertices[0], this.vertices[1])
		this.bottomMid = this.getMidPoint(this.vertices[2], this.vertices[3])
		this.direction = Math.atan2(this.topMid[1] - this.bottomMid[1], this.topMid[0] - this.bottomMid[0]) + Math.PI / 2
		this.distance = distance(this.topMid, this.bottomMid)
		this.lengthInProgress = length / this.distance
	}

	getMidPoint(a, b) {
		return [
			b[0] + (a[0] - b[0]) / 2,
			b[1] + (a[1] - b[1]) / 2
		]
	}

	getWayPoint(a, b, progress) {
		return [
			a[0] + (b[0] - a[0]) * progress,
			a[1] + (b[1] - a[1]) * progress
		]
	}

	getId() {
		return this.id
	}

	getFlakeVertices(progress) {
		return [
			this.getWayPoint(this.vertices[0], this.vertices[3], progress),
			this.getWayPoint(this.vertices[1], this.vertices[2], progress),
			this.getWayPoint(this.vertices[1], this.vertices[2], progress + this.lengthInProgress),
			this.getWayPoint(this.vertices[0], this.vertices[3], progress + this.lengthInProgress),
		]
	}

	render() {
		if (!this.finished) {
			let nowTime = Date.now()
			let progress = ((nowTime - this.startTime) / 1000 * this.speed) / this.distance
			let progressIn = progress * (1 - this.lengthInProgress)
			let opacity = 1
			if (progressIn < this.lengthInProgress) {
				opacity = progressIn / this.lengthInProgress
			} else if (progressIn > 1 - 2 * this.lengthInProgress) {
				opacity = 1 - (progressIn - (1 - 2 * this.lengthInProgress)) / this.lengthInProgress
			}

			let flakeVertices = this.getFlakeVertices(progressIn)

			this.ctx.beginPath()
			this.ctx.moveTo(
				flakeVertices[0][0],
				flakeVertices[0][1]
			)

			for (let i = 1; i < 4; i++) {
				this.ctx.lineTo(
					flakeVertices[i][0],
					flakeVertices[i][1]
				)
			}

			this.ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${opacity})`
			this.ctx.fill()

			if (progress > 1) {
				this.destroy()
			}
		}
	}

	destroy() {
		this.finished = true
		this.finishedCallback(this)
	}

}
