const { dirname } = require('path');
const { rmdir } = require('./fs');

/**
 * Remove built plug-in files
 */
function cleanup() {
	const rootDir = dirname(__dirname);
	rmdir(rootDir + '/iconify.sketchplugin');
}

/**
 * Export or build
 */
if (!module.parent) {
	cleanup();
} else {
	module.exports = cleanup;
}
