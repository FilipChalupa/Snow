module.exports = (array) => {
	for (let i = array.length-1; i >= 0; i--) {
		let x = array[i]
		let randomIndex = Math.floor(Math.random() * array.length)
		array[i] = array[randomIndex]
		array[randomIndex] = x
	}
	return array
}
