export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

const STOP_PROP = (e) => {
	e.stopPropagation();
};


/**
 * Stop mousedown event propagation from ui elements for dragging
 * @param  {DOMNode} Node containing ui elements
 */
Elements.common.stop_drag_events = (node) => {
	for (let input of node.querySelectorAll('input')) {
		if (input.type === 'text') {
			input.addEventListener('mousedown', STOP_PROP);
		}
	}
	for (let select of node.querySelectorAll('select')) {
		select.addEventListener('mousedown', STOP_PROP);
	}
	for (let textarea of node.querySelectorAll('textarea')) {
		textarea.addEventListener('mousedown', (e) => {
			e.stopPropagation();
		});
	}
};

Elements.loaded('drag/Common');
