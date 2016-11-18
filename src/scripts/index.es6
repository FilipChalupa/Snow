var jQueryFallbackProvider = require('./utils/jQueryFallbackProvider')
var componentsHandler = require('./componentsHandler')


var onJQueryAvailable = ($) => {
	require('./plugins')
	componentsHandler({
		'snow': require('./components/snow'),
	})
}

var onJQueryMissing = () => {
	console.log('jQuery dependency is missing. This page might not work correctly. Please try again later.')
}


jQueryFallbackProvider(
	'/node_modules/jquery/dist/jquery.min.js',
	onJQueryAvailable,
	onJQueryMissing
)
