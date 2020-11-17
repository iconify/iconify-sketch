import Iconify from '@iconify/iconify';
import { Icon, iconToString } from '@iconify/search-core';
import type { PartialIconCustomisations } from './customisations/types';
import { Wrapper } from './wrapper';

/**
 * Interfaces
 */
interface UIReadyMessage {
	action: 'ready';
}
interface UICloseMessage {
	action: 'close';
}
interface UIImportMessage {
	action: 'import';
	svg: string;
	name: string;
}
type UIMessage = UIReadyMessage | UICloseMessage | UIImportMessage;

interface SketchWindow {
	postMessage: (key: string, payload: UIMessage) => Promise<unknown>;
	startIconifyPlugin: () => void;
}

/**
 * Send message
 */
function sendMessage(message: UIMessage) {
	console.log('Sending message from UI:', message);
	((window as unknown) as SketchWindow)
		.postMessage('iconify', message)
		.then(() => {})
		.catch((err) => {
			console.error(err);
		});
}

/**
 * Show UI
 */
((window as unknown) as SketchWindow).startIconifyPlugin = () => {
	const container = document.getElementById('container');
	if (container) {
		container.removeAttribute('id');
		container.innerHTML = '';

		/**
		 * Import icon
		 */
		function importIcon(
			icon: Icon | string,
			customisations: PartialIconCustomisations
		): void {
			const name = typeof icon === 'string' ? icon : iconToString(icon);

			// Set height
			if (!customisations.height && !customisations.width) {
				customisations.height = 'auto';
			}

			// Generate SVG
			let svg = Iconify.renderHTML(name, customisations);
			if (!svg) {
				return;
			}

			// Set color
			svg = svg.replace(
				/currentColor/g,
				customisations.color === void 0 ? '#000' : customisations.color
			);

			// Add empty rectangle
			const data = Iconify.getIcon(name)!;
			svg = svg.replace(
				'>',
				'><rect x="' +
					data.left +
					'" y="' +
					data.top +
					'" width="' +
					data.width +
					'" height="' +
					data.height +
					'" fill="none" stroke="none" />'
			);

			// Send message
			sendMessage({
				action: 'import',
				svg,
				name,
			});
		}

		/**
		 * Create Icon Finder
		 */
		const wrapper = new Wrapper({
			container,
			callback: (event) => {
				switch (event.type) {
					case 'button':
						// Button was clicked
						switch (event.button) {
							case 'close':
							case 'cancel':
								// Close window
								sendMessage({
									action: 'close',
								});
								return;

							case 'import':
								// Import icons
								event.state.icons.forEach((icon) => {
									importIcon(
										icon,
										event.state.customisations
									);
								});
								return;
						}
				}
			},
		});
	}
};

/**
 * Send 'ready' action on page loads
 */
/*
document.addEventListener('DOMContentLoaded', () => {
	console.log('Debug: sending message from UI to plug-in...');
	sendMessage({
		action: 'ready',
	});
});
*/
