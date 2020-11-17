const buildScript = require('./script');
const buildStyle = require('./style');
const buildBundle = require('./bundle');
const buildPlugin = require('./plug-in');

// Build stuff
(async () => {
	// Build script
	await buildScript();

	// Build stylesheet
	await buildStyle();

	// Bundle it all in UI package
	await buildBundle();

	// Build plug-in
	await buildPlugin();
})();
