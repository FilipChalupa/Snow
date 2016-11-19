let Component = require('./component')
let Column = require('./parts/column')
let Flake = require('./parts/flake')
let uniqId = require('../utils/uniqId')
let isPointInPolygon = require('../utils/isPointInPolygon')
let distance = require('../utils/distance')

const KEYS = Object.freeze({
	'e': 69,
	'+': 107,
	'-': 109,
	'delete': 46,
	'backspace': 8,
	'enter': 13,
	'space': 32,
})

const FULL_ANGLE = 2 * Math.PI

const DEFAULT_COLUMN_SPREAD = 20

const CURSOR_RADIUS = 10

const INACTIVE_COLOR = '#0000FF'

const ACTIVE_COLOR = '#FFFFFF'

/**
 * Snow component class
 */
module.exports = class Snow extends Component {

	constructor(el, data) {
		super(el, data)

		this.ctx = el.getContext('2d')

		this.editMode = true

		this.movingVertex = false

		this.mousePosition = [0, 0]

		this.columns = []

		this.activeColumn = null

		this.flakes = []

		this.flakesRate = 60 // Per minut

		this.flakeAddTimeout = null

		document.onkeyup = (e) => {
			this.handleKeyDown(e)
		}

		$(window).on('resize', () => {this.resize()})

		this.resize()
		this.loop()
	}

	get listeners() {
		return {
			'mousemove': 'handleMouseMove',
			'mousedown': 'handleMouseDown',
			'mouseup': 'handleMouseUp',
		}
	}

	handleMouseMove(e) {
		this.mousePosition[0] = e.pageX
		this.mousePosition[1] = e.pageY

		if (this.movingVertex !== false) {
			this.activeColumn.setVertexPosition(this.movingVertex, this.mousePosition.slice())
		}
	}

	handleMouseDown(e) {
		if (this.activeColumn) {
			let vertices = this.activeColumn.getVertices()
				for (let i = vertices.length - 1; i >= 0; i--) {
					if (distance(vertices[i], this.mousePosition) < CURSOR_RADIUS) {
						this.movingVertex = i
						return
					}
				}
		}

		for (let i = this.columns.length - 1; i >= 0; i--) {
			if (isPointInPolygon(this.mousePosition, this.columns[i].getVertices())) {
				this.activeColumn = this.columns[i]
				break
			}
		}
	}

	handleMouseUp(e) {
		this.movingVertex = false
	}

	handleKeyDown(e) {
		switch (e.keyCode) {
			case KEYS['e']:
				this.toggleEditMode()
				break
			case KEYS['+']:
			case KEYS['enter']:
			case KEYS['space']:
				this.addColumn()
				break
			case KEYS['delete']:
			case KEYS['backspace']:
			case KEYS['-']:
				this.removeActiveColumn()
				break
			default:
				console.log('Key code: ' + e.keyCode)
		}
	}

	toggleEditMode() {
		this.editMode = !this.editMode

		if (this.editMode) {
			this.flakes = []
			this.clearFlakeAddTimeout()
		} else {
			if (this.columns.length) {
				this.addFlake()
			}
			this.movingVertex = false
		}
	}

	clearFlakeAddTimeout() {
		clearTimeout(this.flakeAddTimeout)
		this.flakeAddTimeout = null
	}

	addFlake() {
		let columnIndex = Math.floor(Math.random() * this.columns.length)
		this.flakes.push(
			new Flake(
				uniqId(),
				this.ctx,
				this.columns[columnIndex].getVertices(),
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
		for (let i = this.flakes.length-1; i >= 0; i--) {
			if (id === this.flakes[i].getId()) {
				this.flakes.splice(i, 1)
				break
			}
		}
	}

	removeActiveColumn() {
		if (!this.editMode || !this.activeColumn) {
			return
		}
		this.removeColumn(this.activeColumn.getId())
		this.activeColumn = null
		this.movingVertex = false
	}

	removeColumn(id) {
		for (let i = this.columns.length-1; i >= 0; i--) {
			if (id === this.columns[i].getId()) {
				this.columns.splice(i, 1)
				break
			}
		}
	}

	addColumn() {
		if (!this.editMode) {
			return
		}
		let column = new Column(
			uniqId(),
			this.ctx,
			[
				[
					this.mousePosition[0] - DEFAULT_COLUMN_SPREAD,
					this.mousePosition[1] - DEFAULT_COLUMN_SPREAD,
				],
				[
					this.mousePosition[0] + DEFAULT_COLUMN_SPREAD,
					this.mousePosition[1] - DEFAULT_COLUMN_SPREAD,
				],
				[
					this.mousePosition[0] + DEFAULT_COLUMN_SPREAD,
					this.mousePosition[1] + DEFAULT_COLUMN_SPREAD,
				],
				[
					this.mousePosition[0] - DEFAULT_COLUMN_SPREAD,
					this.mousePosition[1] + DEFAULT_COLUMN_SPREAD,
				]
			]
		)
		this.columns.push(column)
		this.activeColumn = column
	}

	resize() {
		var rect = this.el.getBoundingClientRect()
		this.el.width = rect.width
		this.el.height = rect.height

		this.render()
	}

	renderEdit() {
		this.columns.forEach((column) => {
			let isActive = this.activeColumn === column
			column.renderSolid(isActive ? ACTIVE_COLOR : INACTIVE_COLOR)

			if (isActive) {
				column.renderHandels()
			}
		})

		this.ctx.beginPath()
		this.ctx.arc(
			this.mousePosition[0],
			this.mousePosition[1],
			CURSOR_RADIUS,
			0,
			FULL_ANGLE
		)
		this.ctx.fillStyle = '#FF0000'
		this.ctx.fill()

		this.ctx.beginPath()
		this.ctx.arc(
			this.mousePosition[0],
			this.mousePosition[1],
			CURSOR_RADIUS / 2,
			0,
			FULL_ANGLE
		)
		this.ctx.fillStyle = '#FFFF00'
		this.ctx.fill()
	}

	loop() {
		this.render()
		requestAnimationFrame(() => {this.loop()})
	}

	render() {
		this.ctx.clearRect(0, 0, this.el.width, this.el.height)

		if (this.editMode) {
			this.renderEdit()
		} else {
			/*this.columns.forEach((column) => {
				column.renderSolid('#FFFFFF')
			})*/
			this.flakes.forEach((flake) => {
				flake.render()
			})
		}
	}

}
