import sketch from 'sketch';
import sketchDOM from 'sketch/dom';
import Settings from 'sketch/settings';
import BrowserWindow from 'sketch-module-web-view';

export default () => {
	const options = {
		width: 800,
		height: 800,
		title: 'Iconify',
		show: false,
	};

	const browserWindow = new BrowserWindow(options);

	const Group = sketchDOM.Group;
	const Style = sketchDOM.Style;

	// Nested layer name prefix
	const prefix = 'Icon ';
	const prefixLength = prefix.length;

	// Names of reserved layers
	const groupName = 'Icon';
	const viewBoxName = 'ViewBox';
	const maskName = 'Color';

	let lastParent = null,
		leftOffset = 0;

	/**
	 * Import icon
	 */
	function importIcon(message) {
		function getPage() {
			return sketch.getSelectedDocument().selectedPage;
		}

		function hasDimensions(layer) {
			return layer && layer.type !== 'Page' && layer.type !== 'Document';
		}

		function deselectLayers() {
			let items = null;
			try {
				items = sketch.getSelectedDocument().selectedLayers;
			} catch (err) {
				return;
			}

			if (items && items.layers) {
				items.layers.forEach((layer) => {
					layer.selected = false;
				});
			}
		}

		function canHaveChildren(parent) {
			if (!parent) {
				return false;
			}
			switch (parent.type) {
				case 'Document':
				case 'Page':
				case 'Artboard':
				case 'Group':
					return true;
			}

			return false;
		}

		/**
		 * Find parent layer
		 */
		function findParentLayer() {
			let parent;

			function findIconParentLayer(layer, deselect) {
				if (!hasDimensions(layer)) {
					return layer;
				}

				let name = layer.name;

				// Reserved name
				if (
					name === viewBoxName ||
					name === maskName ||
					name === groupName
				) {
					if (deselect !== false) {
						deselectLayers();
					}
					return findIconParentLayer(layer.parent, false);
				}

				// Icon
				if (
					layer.type === 'Group' &&
					name.match(/^[a-z0-9]+[:-][a-z0-9\-:]+$/)
				) {
					return layer.parent;
				}

				// Layer inside icon
				if (name.slice(0, prefixLength) === prefix) {
					if (deselect !== false) {
						deselectLayers();
					}
					return findIconParentLayer(layer.parent, false);
				}

				return layer;
			}

			// Find currently selected layer
			try {
				parent = sketch.getSelectedDocument().selectedLayers.layers[0];
			} catch (err) {
				return getPage();
			}
			if (parent === void 0) {
				return getPage();
			}

			// Check if layer is icon
			parent = findIconParentLayer(parent);

			// Check if layer is group
			if (!canHaveChildren(parent)) {
				parent = parent.parent;
				if (!canHaveChildren(parent)) {
					return getPage();
				}
			}

			// Check if group is locked
			if (parent.type === 'Group' && parent.locked) {
				parent = parent.parent;
			}

			return parent;
		}

		function prefixChildren(layer) {
			layer.layers.forEach((item) => {
				item.name = prefix + item.name;
				if (item.layers && item.layers.length) {
					prefixChildren(item);
				}
			});
		}

		function checkLastParentPosition(parent) {
			if (!hasDimensions(parent)) {
				// Invalid parent
				if (!lastParent || lastParent.type !== 'None') {
					lastParent = {
						type: 'None',
					};
					leftOffset = 0;
				}
				return;
			}

			if (
				!lastParent ||
				// Check type and name
				lastParent.type !== parent.type ||
				lastParent.name !== parent.name ||
				// Check frame dimensions
				lastParent.width !== parent.frame.width ||
				lastParent.height !== parent.frame.height
			) {
				leftOffset = 0;
				// log('Parent item has changed');
				lastParent = {
					type: parent.type,
					name: parent.name,
					width: parent.frame.width,
					height: parent.frame.height,
				};
			}
		}

		function placeInMiddle(layer, parent) {
			checkLastParentPosition(parent);

			let parentFrame = hasDimensions(parent) ? parent.frame : null,
				layerFrame = layer.frame;

			if (!layerFrame) {
				return;
			}

			// Horizontal center
			if (parentFrame && parentFrame.width <= layerFrame.width) {
				layer.frame.x = 0;
			} else {
				layer.frame.x =
					(parentFrame
						? Math.floor((parentFrame.width - layerFrame.width) / 2)
						: 0) + leftOffset;
				leftOffset += Math.ceil(layerFrame.width);
			}

			// Vertical center
			if (!parentFrame || parentFrame.height <= layerFrame.height) {
				layer.frame.y = 0;
			} else {
				layer.frame.y = Math.floor(
					(parentFrame.height - layerFrame.height) / 2
				);
			}
		}

		function cleanUpIcon(layer) {
			// Set name
			layer.name = message.name;

			// Add "Icon" to all icons
			prefixChildren(layer);

			// Check for nested empty group
			if (layer.layers.length === 1 && layer.layers[0].type === 'Group') {
				try {
					layer.layers[0]._object.ungroup();
				} catch (err) {}
			}

			// Remove old nested empty group
			if (layer.layers.length === 1 && layer.layers[0].type === 'Group') {
				try {
					layer.layers[0]._object.ungroup();
				} catch (err) {}
			}

			// Check if empty nested group exists
			if (layer.layers.length > 1) {
				// Nested layer not found - group everything
				let group = new Group({
					layers: [],
					name: prefix + 'Group',
					parent: layer.parent,
				});
				layer.layers.forEach((item) => {
					item.parent = group;
				});
				group.parent = layer;
				try {
					group._object.resizeToFitChildrenWithOption(1);
				} catch (err) {}
				try {
					group._object.fixGeometryWithOptions(1);
				} catch (err) {}
			}

			// Check requirements for going further
			if (
				layer.layers.length !== 1 ||
				layer.layers[0].type !== 'Group' ||
				layer.layers[0].layers.length < 2
			) {
				// Should have 1 group layer with 2+ nested layers
				log('Error: wrong number of nested layers');
				return;
			}
			layer.layers[0].name = groupName;
			try {
				layer.layers[0]._object.setConstrainProportions(1);
			} catch (err) {}

			// Find viewBox
			let container = layer.layers[0],
				viewBox = null,
				i;

			for (i = container.layers.length - 1; i >= 0; i--) {
				let child = container.layers[i];
				if (
					child.name === prefix + 'Rectangle' &&
					child.style.fills.length === 1 &&
					child.style.borders.length === 0 &&
					child.style.fills[0].color === '#00000000'
				) {
					if (viewBox !== null) {
						// Duplicate viewBox?
						log('Error: duplicate viewBox');
						return;
					}
					viewBox = child;
				}
			}
			if (viewBox === null) {
				log('Error: missing viewBox');
				return;
			}

			// Move viewBox outside of container and to back, use it as mask
			viewBox.parent = layer;
			viewBox.style.fills = [];
			/*
			viewBox.moveToBack();
			viewBox.style.fills[0].color = '#000000';
			viewBox._object.hasClippingMask = true;
			viewBox._object.clippingMaskMode = 1;
			*/

			viewBox.name = viewBoxName;

			// Update container frame
			let viewBoxFrame = viewBox.frame,
				requireUpdate = false;
			['x', 'y', 'width', 'height'].forEach((prop) => {
				if (container.frame[prop] !== viewBoxFrame[prop]) {
					requireUpdate = true;
				}
			});

			if (requireUpdate) {
				try {
					container._object.resizeToFitChildrenWithOption(1);
				} catch (err) {}
				try {
					container._object.fixGeometryWithOptions(1);
				} catch (err) {}
			}
		}

		function finalizeLayer(layer) {
			// Lock width/height ratio
			try {
				layer._object.setConstrainProportions(1);
			} catch (err) {}
		}

		// Import layer
		// const layer = importSVG(message.svg);
		const layer = sketch.createLayerFromData(message.svg, 'svg');

		// Find parent layer and put layer inside it
		const parent = findParentLayer();
		placeInMiddle(layer, parent);
		layer.parent = parent;

		// Apply mask and stuff
		cleanUpIcon(layer);

		// Select/deselect layers
		if (parent && hasDimensions(parent) && parent.selected) {
			deselectLayers();
		}
		layer.selected = true;

		// Finalize stuff
		finalizeLayer(layer);
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
			}
		}
	});

	// Show window, load plug-in
	browserWindow.once('ready-to-show', () => {
		console.log('ready-to-show');
		browserWindow.show();
	});

	browserWindow.webContents.on('did-finish-load', () => {
		console.log('did-finish-load');
		if (!browserWindow.isVisible()) {
			browserWindow.show();
		}
		browserWindow.webContents
			.executeJavaScript('startIconifyPlugin();')
			.then(() => {})
			.catch((err) => {
				console.error(err);
			});
	});

	browserWindow.loadURL(require('../dist/ui.html'));
};
