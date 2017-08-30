'use strict'

Elements.require('drag-body');
/**
 * DragElement
 * Designed to hold contents to be dragged.
 * Must be placed within a DragBody
 */
Elements.elements.DragElement = class extends Elements.elements.backbone {
	constructor () {
		super();

		const self = this;
		this.name = 'DragElement';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let drag_start = (event) => {
			// Pushing the element been dragged and the drag body to the
			// top of the z-indexes is probably a good idea
			let style = window.getComputedStyle(self.shadowRoot.querySelector('#pseudoBody'), null);
			let left = (parseInt(style.getPropertyValue("left"),10) - event.clientX).toString();
			let top = (parseInt(style.getPropertyValue("top"),10) - event.clientY).toString();
			let id = self.id;
			let data = left + ',' + top + ',' + id;
			event.dataTransfer.setData('text/plain', data);
			event.dataTransfer.setDragImage(self.parentNode.getDragImage(), 0, 0);
			self.parentNode.toTop(self);
			self.parentNode.drag.left = left;
			self.parentNode.drag.top = top;
			self.parentNode.drag.id = id;
		};
		template.querySelector('#pseudoBody').addEventListener('dragstart', drag_start);
		shadow.appendChild(template);

	}
};

Elements.load('dragElementTemplate.html', Elements.elements.DragElement, 'elements-drag-element');
