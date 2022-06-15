/**
 * Attempt to clean up SVG
 */
 export function cleanupSVG(code: string): string {
	const node = document.createElement('span');
	const shadow = node.attachShadow({
		mode: 'open',
	});
	shadow.innerHTML = code;
	let modified = false;

	const svg = shadow.querySelector('svg');
	const removeAttributes = ['stroke-dasharray', 'stroke-dashoffset'];

	function testChildren(node: Element) {
		Array.from(node.childNodes).forEach((child) => {
			if (child instanceof Element) {
				test(child);
			}
		});
	}

	function test(node: Element) {
		const parent = node.parentElement as Element;

		function changeValue(attr: string, lastValue: string) {
			if (removeAttributes.indexOf(attr) !== -1) {
				// Attribute was removed
				return;
			}

			const oldValue = parent.getAttribute(attr);

			// Convert to numbers
			const oldNum = parseFloat(oldValue || '');
			const lastNum = parseFloat(lastValue);

			// Get to maximum value
			let newValue;
			switch (attr) {
				case 'stroke-dashoffset': {
					// Set offset to 0
					newValue = '0';
					break;
				}

				case 'fill-opacity': {
					// Set opacity to non-null value
					newValue = lastNum ? lastValue : oldValue;
					break;
				}

				// Set to non-null or final value
				default: {
					newValue = !lastNum && oldNum ? oldValue : lastValue;
				}
			}

			if (newValue) {
				modified = true;
				parent.setAttribute(attr, newValue);
			}
		}

		// Remove stroke attributes
		removeAttributes.forEach((attr) => {
			try {
				if (node.hasAttribute(attr)) {
					modified = true;
					node.removeAttribute(attr);
				}
			} catch {}
		});

		// Check tag
		switch (node.tagName) {
			case 'discard':
			case 'animateMotion':
			case 'animateTransform': {
				// Not supported and should be removed
				modified = true;
				parent.removeChild(node);
				return;
			}

			case 'set': {
				modified = true;
				const attr = node.getAttribute('attributeName');
				const value = node.getAttribute('to');
				if (attr && value) {
					changeValue(attr, value);
				}
				parent.removeChild(node);
				return;
			}

			case 'animate': {
				modified = true;
				const attr = node.getAttribute('attributeName');
				const values = node.getAttribute('values');
				if (attr && values) {
					const valuesList = values.split(';');
					let lastValue = valuesList.pop() as string;
					if (valuesList.length > 1 && valuesList[0] === lastValue) {
						// First and last values are identical, more than 1 value.
						// Probably repeating animation. Use second to last value
						lastValue = valuesList.pop() as string;
					}
					changeValue(attr, lastValue);
				}
				parent.removeChild(node);
				return;
			}

		}

		testChildren(node);
	}

	if (svg) {
		testChildren(svg);
		return modified ? svg.outerHTML.replace(/currentcolor/ig, 'currentColor') : code;
	} else {
		return code;
	}
}
