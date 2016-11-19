const HANDEL_RADIUS = 5
const HANDEL_TOP_COLOR = '#00FF00'
const HANDEL_BOTTOM_COLOR = '#FF0000'

const FULL_ANGLE = 2 * Math.PI

module.exports = class Column {

	constructor(id, ctx, vertices) {
		this.id = id
		this.ctx = ctx
		this.setVertices(vertices || [
			// Top left
			[0, 0],
			// Top right
			[0, 0],
			// Bottom right
			[0, 0],
			// Bottom left
			[0, 0],
		])
	}

	equals(column) {
		return this.id === column.id
	}

	getId() {
		return this.id
	}

	getVertices() {
		return this.vertices
	}

	setVertices(vertices) {
		this.vertices = vertices
	}

	setVertexPosition(i, position) {
		this.vertices[i] = position
	}

	renderSolid(color) {
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

		this.ctx.fillStyle = color
		this.ctx.fill();
	}

	renderHandels() {
		this.vertices.forEach((vertex, i) => {
			this.ctx.beginPath()
			this.ctx.arc(
				vertex[0],
				vertex[1],
				HANDEL_RADIUS / 2,
				0,
				FULL_ANGLE
			)
			this.ctx.fillStyle = i < 2 ? HANDEL_TOP_COLOR : HANDEL_BOTTOM_COLOR
			this.ctx.fill()
		})
	}

}
