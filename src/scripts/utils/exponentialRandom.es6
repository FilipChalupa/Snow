const RATE = 5

module.exports = () => {
	let x = -Math.log(Math.random()) / RATE
	if (x >= 1) {
		return 0
	}
	return x
}
