import Iconify from '@iconify/iconify';
import { Icon, iconToString } from '@iconify/search-core';
import type { PartialIconCustomisations } from '@iconify/search-core/lib/misc/customisations';
import { Wrapper } from './wrapper';
import type { InitialIconFinderState } from './wrapper/state';

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
	customisations: PartialIconCustomisations;
}
interface UIStateMessage {
	action: 'state';
	state: Partial<InitialIconFinderState>;
}
interface UIResizeMessage {
	action: 'resize';
	width: number;
	height: number;
}
interface UIExternalLinkMessage {
	action: 'link';
	href: string;
}
type UIMessage =
	| UIReadyMessage
	| UICloseMessage
	| UIImportMessage
	| UIStateMessage
	| UIResizeMessage
	| UIExternalLinkMessage;

interface SketchWindow {
	postMessage: (key: string, payload: UIMessage) => Promise<unknown>;
	startIconifyPlugin: (state: Partial<InitialIconFinderState>) => void;
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
((window as unknown) as SketchWindow).startIconifyPlugin = (
	state: Partial<InitialIconFinderState>
) => {
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

			// Copy customisations to avoid modifying object
			const props = Object.assign({}, customisations);

			// Set height
			if (!props.height && !props.width) {
				props.height = 'auto';
			}

			// Generate SVG
			let svg = Iconify.renderHTML(name, props);
			if (!svg) {
				return;
			}

			// Set color
			svg = svg.replace(
				/currentColor/g,
				props.color === void 0 ? '#000' : props.color
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
				customisations,
			});
		}

		/**
		 * Store current state
		 */
		function storeState() {
			const state = wrapper.getState();
			sendMessage({
				action: 'state',
				state,
			});
		}

		/**
		 * Create Icon Finder
		 */
		const wrapper = new Wrapper({
			container,
			state,
			callback: (event) => {
				switch (event.type) {
					case 'button':
						// Button was clicked
						switch (event.button) {
							case 'close':
							case 'cancel':
								// Store config and close window
								storeState();
								sendMessage({
									action: 'close',
								});
								wrapper.destroy();
								return;

							case 'import':
								// Import icons
								event.state.icons.forEach((icon) => {
									importIcon(
										icon,
										event.state.customisations
									);
								});
								storeState();
								return;
						}
						break;

					case 'link':
						// External link was clicked
						event.event.preventDefault();
						sendMessage({
							action: 'link',
							href: event.href,
						});
						break;
				}
			},
		});

		/**
		 * Check window size
		 */
		let resizing = false;
		window.addEventListener('resize', () => {
			if (resizing) {
				// Throttle
				return;
			}
			resizing = true;
			setTimeout(() => {
				if (wrapper.getStatus() === 'destroyed') {
					return;
				}
				resizing = true;
				sendMessage({
					action: 'resize',
					width: window.innerWidth,
					height: window.innerHeight,
				});
			}, 1000);
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
