let Component = require('./component')
let Column = require('./parts/column')
let uniqId = require('../utils/uniqId')
let isPointInPolygon = require('../utils/isPointInPolygon')
let distance = require('../utils/distance')
let environments = {
	Snow: require('./environments/snow'),
	Storm: require('./environments/storm'),
}

const KEYS = Object.freeze({
	'+': 107,
	'-': 109,
	'c': 67,
	'e': 69,
	'o': 79,
	'r': 82,
	's': 83,
	'backspace': 8,
	'delete': 46,
	'enter': 13,
	'space': 32,
})

const FULL_ANGLE = 2 * Math.PI

const DEFAULT_COLUMN_SPREAD = 20

const CURSOR_RADIUS = 10

const INACTIVE_COLOR = '#0000FF'

const ACTIVE_COLOR = '#FFFFFF'

const DEFAULT_ENVIRONMENT = 'Snow'

const DEFAULT_OPTIONS = Object.freeze({
	Snow: {
		rate: 60, // Per minute
		height: 10,
		speed: 20,
		color: [255,255,255],
	},
	Storm: {
		rate: 100, // Per minute
		color: [255,255,255],
	}
})

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
		this.mouseDown = false

		this.columns = []

		this.activeColumn = null

		this.environment = null

		this.environmentName = DEFAULT_ENVIRONMENT

		this.options = Object.assign({}, DEFAULT_OPTIONS)

		if (this.data.data) {
			this.loadFromData(this.data.data)
			this.runEnvironment()
		}

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
		this.mouseDown = true

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
		this.mouseDown = false
		this.movingVertex = false
	}

	handleKeyDown(e) {
		switch (e.keyCode) {
			case KEYS['e']:
			case KEYS['space']:
				this.toggleEditMode()
				break
			case KEYS['+']:
			case KEYS['enter']:
				this.addColumn()
				break
			case KEYS['delete']:
			case KEYS['backspace']:
			case KEYS['-']:
				this.removeActiveColumn()
				break
			case KEYS['s']:
				this.save()
				break
			case KEYS['o']:
				this.load()
				break
			case KEYS['c']:
				this.changeEnvironment()
				break
			case KEYS['r']:
				this.reload()
				break
			default:
				console.log('Key code: ' + e.keyCode)
		}
	}

	changeEnvironment() {
		let match = false
		for (let name in environments) {
			if (match) {
				this.environmentName = name
				match = false
				break
			}
			if (name === this.environmentName) {
				match = true
			}
		}
		if (match) {
			for (this.environmentName in environments) {
				break
			}
		}

		if (!this.editMode) {
			this.destroyEnvironment()
			this.createEnvironment()
		}
	}

	reload() {
		location.reload()
	}

	save() {
		let data = {
			environment: this.environmentName,
			options: this.options,
			columns: [],
		}
		this.columns.forEach((column) => {
			data.columns.push(column.getVertices())
		})
		localStorage.setItem('data', JSON.stringify(data))
	}

	load() {
		this.loadFromData(JSON.parse(localStorage.getItem('data')))
	}

	loadFromData(data) {
		if (!data) {
			return
		}
		this.environmentName = data.environment
		this.options = Object.assign(this.options, data.options)
		this.columns = []
		this.activeColumn = null
		this.movingVertex = false
		data.columns.forEach((column) => {
			this.createColumn(column)
		})
	}

	toggleEditMode() {
		this.editMode = !this.editMode

		if (this.editMode) {
			this.destroyEnvironment()
		} else {
			this.movingVertex = false
			this.runEnvironment()
		}
	}

	createEnvironment() {
		this.environment = new environments[this.environmentName](this.ctx, this.columns, this.options[this.environmentName])
	}

	destroyEnvironment() {
		if (this.environment) {
			this.environment.destroy()
			this.environment = null
		}
	}

	runEnvironment() {
		this.editMode = false
		this.createEnvironment()
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
		let column = this.createColumn([
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
		])
		this.activeColumn = column
	}

	createColumn(vertices) {
		let column = new Column(
			uniqId(),
			this.ctx,
			vertices
		)
		this.columns.push(column)
		return column
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
		this.ctx.fillStyle = this.mouseDown ? '#FFFF00' : '#FF0000'
		this.ctx.fill()
	}

	loop() {
		this.render()
		requestAnimationFrame(() => {this.loop()})

		/* // FPS logging
		this.lastLoop = this.lastLoop || new Date
		this.thisLoop = new Date
		let fps = Math.floor(1000 / (this.thisLoop - this.lastLoop))
		this.lastLoop = this.thisLoop
		console.log('FPS: ', fps)
		*/
	}

	render() {
		this.ctx.clearRect(0, 0, this.el.width, this.el.height)

		if (this.editMode) {
			this.renderEdit()
		} else {
			this.environment.render()
		}
	}

}
