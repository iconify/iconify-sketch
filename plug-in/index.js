import sketch from 'sketch';
import sketchDOM from 'sketch/dom';
import Settings from 'sketch/settings';
import BrowserWindow from 'sketch-module-web-view';

export default () => {
	// Key to store config
	const configKey = 'iconify2';

	// Name used for fake rectangle
	const viewBoxName = 'ViewBox';

	// Browser window
	const options = {
		width: 800,
		height: 800,
		title: 'Iconify',
		show: false,
	};

	const browserWindow = new BrowserWindow(options);

	/**
	 * Get possible parent layers
	 */
	function getUsableLayers() {
		// Add page to result
		const doc = sketchDOM.getSelectedDocument();
		const page = doc.selectedPage;
		const results = [
			{
				id: page.id,
				type: page.type,
				name: page.name,
			},
		];

		// Get root layer
		function getUsableRoot(layer) {
			// Check for icon
			let test = layer;
			while (test) {
				// Check layer type
				if (test.type === 'Artboard' || test.type === 'Page') {
					return layer;
				}

				// Check for imported viewBox
				if (test.type === 'ShapePath' && test.name === viewBoxName) {
					layer = test = test.parent.parent;
					continue;
				}

				// Check layer type
				if (test.type !== 'Group') {
					// Cannot use shape as parent
					layer = test = test.parent;
					continue;
				}

				// Check if layer is locked or hidden
				if (test.locked || test.hidden) {
					// Cannot use locked/hidden layer - use parent
					layer = test = test.parent;
					continue;
				}

				// Check for icon
				if (
					test.type === 'Group' &&
					test.name.match(/^[a-z0-9-]+:[a-z0-9]+[a-z0-9\-:]*$/)
				) {
					// Found possible icon? Use parent layer
					layer = test = test.parent;
					continue;
				}

				// Check parent layer
				test = test.parent;
			}

			return layer;
		}

		// Check all selected layers
		const selection = doc.selectedLayers;
		if (selection && selection.layers) {
			selection.layers.forEach((layer) => {
				// Get usable parent layer
				layer = getUsableRoot(layer);
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
				});
			});
		}

		return results;
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

		// Temp: append to page
		layer.parent = page;

		// Select layer
		layer.selected = true;
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
