const DURATION = 250

module.exports = class Flash {

	constructor(ctx, columnVertices, color, finishedCallback) {
		this.ctx = ctx
		this.vertices = columnVertices
		this.color = color
		this.finishedCallback = finishedCallback
		this.startTime = null
	}

	flash() {
		this.startTime = Date.now()
	}

	render() {
		if (this.startTime) {
			let nowTime = Date.now()
			let opacity = 1 - ((nowTime - this.startTime) / DURATION)
			if (opacity < 0) {
				this.startTime = null
				return
			}

			this.ctx.beginPath()

			this.ctx.moveTo(
				this.vertices[0][0],
				this.vertices[0][1]
			)

			for (let i = 1; i < 4; i++) {
				this.ctx.lineTo(
					this.vertices[i][0],
					this.vertices[i][1]
				)
			}

			this.ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${opacity})`
			this.ctx.fill();
		}
	}

	destroy() {
		this.finishedCallback(this)
	}

}
