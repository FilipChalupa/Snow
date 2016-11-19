const FLAKE_WIDTH = 300

module.exports = class Flake {

	constructor(id, ctx, columnVertices, lifeSpan, height, color, finishedCallback) {
		this.id = id
		this.ctx = ctx
		this.vertices = columnVertices
		this.lifeSpan = lifeSpan
		this.height = height
		this.color = color
		this.finishedCallback = finishedCallback
		this.startTime = Date.now()

		this.finished = false

		this.directColumn()

		this.topMid = this.getMidPoint(this.vertices[0], this.vertices[1])
		this.bottomMid = this.getMidPoint(this.vertices[2], this.vertices[3])
		this.direction = Math.atan2(this.topMid[1] - this.bottomMid[1], this.topMid[0] - this.bottomMid[0]) + Math.PI / 2
	}

	getMidPoint(a, b) {
		return [
			b[0] + (a[0] - b[0]) / 2,
			b[1] + (a[1] - b[1]) / 2
		]
	}

	getWayPoint(a, b, progress) {
		progress = -0.1 + progress * 1.2
		return [
			a[0] + (b[0] - a[0]) * progress,
			a[1] + (b[1] - a[1]) * progress
		]
	}

	getId() {
		return this.id
	}

	directColumn() {
		this.vertices = this.vertices // @TODO
	}

	render() {
		if (!this.finished) {
			let nowTime = Date.now()
			let progress = (nowTime - this.startTime) / this.lifeSpan

			let position = this.getWayPoint(this.topMid, this.bottomMid, progress)

			this.ctx.save()
			this.ctx.beginPath()
			this.ctx.translate(position[0], position[1])
			this.ctx.rotate(this.direction)
			this.ctx.rect(
				FLAKE_WIDTH / -2,
				this.height / -2,
				FLAKE_WIDTH,
				this.height,
			)

			this.ctx.fillStyle = this.color
			this.ctx.fill()
			this.ctx.restore()

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
