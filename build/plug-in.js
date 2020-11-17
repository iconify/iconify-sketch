const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const config = require('./config');

/**
 * Build function
 */
async function build() {
	const rootDir = path.dirname(__dirname);

	// Run script
	const result = child_process.spawnSync('npm', ['run', 'build:plugin'], {
		cwd: rootDir,
		stdio: 'inherit',
	});

	if (result.status !== 0) {
		throw new Error(`Error building plug-in.`);
	}
}

/**
 * Export or build
 */
if (!module.parent) {
	build().catch((err) => {
		console.error(err);
	});
} else {
	module.exports = build;
}
