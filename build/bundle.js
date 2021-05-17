const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const config = require('./config');

const rootDir = path.dirname(__dirname);
const distDir = rootDir + '/' + config.output.dir;

const min = process.env.NODE_ENV !== 'development';
if (!min) {
	console.log(
		'\nWarning: creating development build that contains full files. To create production build run `npm run rel`.\n'
	);
}

/**
 * Parse chunk
 */
function parseChunk(key) {
	function embedScript(filename) {
		const content = fs
			.readFileSync(filename, 'utf8')
			.replace('//# sourceMappingURL=icon-finder.js.map', '');

		return '<script lang="javascript">\n' + content + '\n</script>';
	}

	function embedStyle(filename) {
		const content = fs.readFileSync(filename, 'utf8');
		return '<style>\n' + content + '\n</style>';
	}

	switch (key) {
		/*
		case 'iconify':
			return embedScript(
				require.resolve(
					'@iconify/iconify/dist/iconify' +
						(min ? '.min' : '') +
						'.js'
				)
			);
		*/

		case 'icon-finder':
			return embedScript(
				distDir +
					'/' +
					(min
						? config.output.script.replace(/.js$/, '.min.js')
						: config.output.script)
			);

		case 'stylesheet':
			return embedStyle(distDir + '/' + config.output.style);

		case 'line-md':
			return embedStyle(require.resolve('line-md/line-md.css'));
	}

	throw new Error(`Unknown file: ${key}`);
}

/**
 * Build function
 */
async function build() {
	// Load template
	let html = fs.readFileSync(rootDir + '/' + config.build.html, 'utf8');

	// Find all items to inject
	const search1 = '<!-- inject:';
	const search2 = '-->';
	const parts = [];
	html.split(search1).forEach((chunk, index) => {
		if (!index) {
			// First chunk
			parts.push(chunk);
			return;
		}

		// Find end of HTML comment
		const pos = chunk.indexOf(search2);
		if (pos === -1) {
			throw new Error('Missing end of HTML comment');
		}
		const key = chunk.slice(0, pos).trim();
		parts.push(parseChunk(key));
		parts.push(chunk.slice(pos + search2.length));
	});

	// Merge parts
	html = parts.join('');

	// Save output
	fs.writeFileSync(distDir + '/' + config.output.html, html, 'utf8');
	console.log(
		`Saved ${config.output.dir}/${config.output.html} (${html.length} bytes)`
	);
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
