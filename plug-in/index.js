import sketch from 'sketch';
import sketchDOM from 'sketch/dom';
import Settings from 'sketch/settings';
import BrowserWindow from 'sketch-module-web-view';

export default () => {
	// Keys for storage
	const windowSizeKey = 'iconify-window';
	const configKey = 'iconify2';
	const iconDataKey = 'iconify';

	// Name used for fake rectangle
	const viewBoxName = 'ViewBox';

	// Browser window
	let windowOptions;
	try {
		windowOptions = JSON.parse(Settings.settingForKey(windowSizeKey));
	} catch (err) {}
	const browserOptions = {
		width:
			windowOptions && typeof windowOptions.width === 'number'
				? windowOptions.width
				: 760,
		height:
			windowOptions && typeof windowOptions.height === 'number'
				? windowOptions.height
				: 600,
		title: 'Iconify',
		show: false,
	};

	const browserWindow = new BrowserWindow(browserOptions);

	// Offset for importing layers
	let offsetX = 0;

	/**
	 * Get possible parent layers
	 */
	/*
	function getUsableLayers() {
		const tested = {};

		// Add page to result
		const doc = sketchDOM.getSelectedDocument();
		const page = doc.selectedPage;
		const results = [
			{
				id: page.id,
				type: page.type,
				name: page.name,
				// Optional: not passed to UI
				layer: page,
			},
		];

		// Check if group is imported icon
		function isIconGroup(layer) {
			if (layer.name.match(/^[a-z0-9-]+:[a-z0-9]+[a-z0-9\-:]*$/)) {
				return true;
			}
			return false;
		}

		// Get root layer (fast version)
		function getUsableRoot(layer) {
			// Hidden or locked
			if (layer.hidden || layer.locked) {
				return null;
			}

			// Check layer type
			switch (layer.type) {
				case 'Artboard':
					// Always use artboard
					return {
						layer,
					};

				case 'ShapePath':
				case 'Group':
					// Check for parent icon
					if (layer.type === 'Group' && isIconGroup(layer)) {
						return {
							layer: layer.parent,
							isIconParent: true,
						};
					}

					// Check for parent artboard
					if (layer.parent.type === 'Artboard') {
						return {
							layer: layer.parent,
						};
					}
					break;
			}

			return null;
		}

		// Get root layer (slow version)
		function getUsableRoot_(layer) {
			// Check for icon
			let test = layer;
			let isIconParent = false;
			while (test) {
				// Avoid re-checking layer
				const id = test.id;
				if (tested[id]) {
					return null;
				}
				tested[id] = true;

				// Check layer type
				if (test.type === 'Artboard' || test.type === 'Page') {
					return {
						layer,
						isIconParent,
					};
				}

				// Check for imported viewBox
				if (test.type === 'ShapePath' && test.name === viewBoxName) {
					layer = test = test.parent.parent;
					isIconParent = true;
					continue;
				}

				// Check layer type
				if (test.type !== 'Group') {
					// Cannot use shape as parent
					layer = test = test.parent;
					isIconParent = false;
					continue;
				}

				// Check if layer is locked or hidden
				if (test.locked || test.hidden) {
					// Cannot use locked/hidden layer - use parent
					layer = test = test.parent;
					isIconParent = false;
					continue;
				}

				// Check for icon
				if (
					test.type === 'Group' &&
					test.name.match(/^[a-z0-9-]+:[a-z0-9]+[a-z0-9\-:]*$/)
				) {
					// Found possible icon? Use parent layer
					layer = test = test.parent;
					isIconParent = true;
					continue;
				}

				// Check parent layer
				test = test.parent;
				isIconParent = false;
			}

			return {
				layer,
				isIconParent,
			};
		}

		// Check all selected layers
		const selection = doc.selectedLayers;
		if (selection && selection.layers) {
			selection.layers.forEach((layer) => {
				// Get usable parent layer
				const item = getUsableRoot(layer);
				if (!item) {
					return;
				}

				layer = item.layer;
				if (
					!layer ||
					layer.type === 'Page' ||
					layer.type === 'Document'
				) {
					return;
				}

				const id = layer.id;
				for (let i = 0; i < results.length; i++) {
					if (results[i].id === id) {
						return;
					}
				}

				// Add item
				results.push({
					id,
					type: layer.type,
					name: layer.name,
					// Optional
					isIconParent: item.isIconParent,
					// Optional: not passed to UI
					layer,
				});
			});
		}

		console.log(results);
		return results;
	}
	*/

	/**
	 * Assign parent layer
	 */
	function assignParent(layer, parent) {
		layer.parent = parent;
		const frame = layer.frame;

		// Move first layer to "0, 0", following layers horizontally from first layer
		frame.x = offsetX;
		frame.y = 0;
		offsetX += frame.width;
	}

	/**
	 * Import icon
	 */
	function importIcon(message) {
		/**
		 * Remove empty nested group
		 */
		function unGroupChildren(layer) {
			if (
				layer.layers &&
				layer.layers.length === 1 &&
				layer.layers[0].type === 'Group'
			) {
				try {
					layer.layers[0]._object.ungroup();
					return true;
				} catch (err) {
					console.error(err);
				}
			}
			return false;
		}

		// Import SVG
		const layer = sketch.createLayerFromData(message.svg, 'svg');

		// Rename it
		layer.name = message.name;

		// Current document, page and selection
		const doc = sketchDOM.getSelectedDocument();
		const page = doc.selectedPage;
		const selection = doc.selectedLayers;
		// console.log('Selection:', getUsableLayers());

		// Clean up layer
		unGroupChildren(layer);

		try {
			layer._object.resizeToFitChildrenWithOption(1);
		} catch (err) {}
		try {
			layer._object.fixGeometryWithOptions(1);
		} catch (err) {}

		// Find and rename viewBox
		if (layer.layers && layer.layers.length > 1) {
			const firstChild = layer.layers[0];
			if (
				firstChild.type === 'ShapePath' &&
				firstChild.name === 'Rectangle'
			) {
				firstChild.name = viewBoxName;
			}
		}

		// Assign parent
		let parent = null;
		/*
		console.log('Getting usable parent layers at ' + Date.now());
		getUsableLayers().forEach((item) => {
			if (parent === null) {
				parent = item;
				return;
			}

			if (item.isIconParent && !parent.isIconParent) {
				// Selected layer is parent of imported icon: use it
				parent = item;
				return;
			}
			if (parent.isIconParent) {
				return;
			}

			// Layers without child icons
			if (item.type === 'Artboard' && parent.type !== item.type) {
				// Artboard
				parent = item;
			}
		});
		console.log('Got usable parent layers at ' + Date.now());
		*/

		assignParent(layer, parent ? parent.layer : page);

		// Select layer
		layer.selected = true;

		// Assign data for future use
		Settings.setLayerSettingForKey(
			layer,
			iconDataKey,
			JSON.stringify({
				name: message.name,
				customisations: message.customisations,
			})
		);
	}

	/**
	 * Handle messages from UI
	 */
	browserWindow.webContents.on('iconify', (message) => {
		// Check action
		if (typeof message === 'object' && typeof message.action === 'string') {
			console.log('Got message:', message);
			switch (message.action) {
				case 'close':
					// Close window
					browserWindow.hide();
					return;

				case 'import':
					// Import icon
					try {
						importIcon(message);
					} catch (err) {
						console.error(err);
					}
					return;

				case 'state':
					// Store state
					Settings.setSettingForKey(
						configKey,
						JSON.stringify(message.state)
					);
					return;

				case 'resize':
					// Window was resized
					Settings.setSettingForKey(
						windowSizeKey,
						JSON.stringify(message)
					);
					return;

				case 'link':
					// Click external llink
					NSWorkspace.sharedWorkspace().openURL(
						NSURL.URLWithString(message.href)
					);
					return;
			}
		}
	});

	// Show window, load plug-in
	browserWindow.once('ready-to-show', () => {
		browserWindow.show();
	});

	browserWindow.webContents.on('did-finish-load', () => {
		if (!browserWindow.isVisible()) {
			browserWindow.show();
		}

		let config;
		try {
			config = JSON.parse(Settings.settingForKey(configKey));
		} catch (err) {}

		browserWindow.webContents
			.executeJavaScript(
				'startIconifyPlugin(' +
					(typeof config === 'object'
						? JSON.stringify(config)
						: '{}') +
					');'
			)
			.then(() => {})
			.catch((err) => {
				console.error(err);
			});
	});

	browserWindow.loadURL(require('../dist/ui.html'));
};
