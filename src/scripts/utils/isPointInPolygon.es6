module.exports = (point, polygon) => {
	let isInside = false
	let minX = polygon[0][0], maxX = polygon[0][0]
	let minY = polygon[0][1], maxY = polygon[0][1]

	for (let n = 1; n < polygon.length; n++) {
		let q = polygon[n]
		minX = Math.min(q[0], minX)
		maxX = Math.max(q[0], maxX)
		minY = Math.min(q[1], minY)
		maxY = Math.max(q[1], maxY)
	}

	if (point[0] < minX || point[0] > maxX || point[1] < minY || point[1] > maxY) {
			return false
	}

	let i = 0, j = polygon.length - 1
	for (i, j; i < polygon.length; j = i++) {
		if ((polygon[i][1] > point[1]) != (polygon[j][1] > point[1]) &&
					point[0] < (polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0] ) {
				isInside = !isInside
		}
	}

	return isInside;
}
