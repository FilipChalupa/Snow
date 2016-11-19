module.exports = (a, b, progress) => {
	return [
		a[0] + (b[0] - a[0]) * progress,
		a[1] + (b[1] - a[1]) * progress
	]
}
