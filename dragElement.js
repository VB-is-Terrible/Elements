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

		this.name = 'DragElement';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let drag_start = (event) => {
			// Pushing the element been dragged and the drag body to the
			// top of the z-indexes is probably a good idea
			let style = window.getComputedStyle(this.shadowRoot.querySelector('#pseudoBody'), null);
			let left = (parseInt(style.getPropertyValue("left"),10) - event.clientX).toString();
			let top = (parseInt(style.getPropertyValue("top"),10) - event.clientY).toString();
			let id = this.id;
			let data = left + ',' + top + ',' + id;
			event.dataTransfer.setData('text/plain', data);
			event.dataTransfer.setDragImage(this.parentNode.getDragImage(), 0, 0);
			this.parentNode.toTop(this);
			this.parentNode.drag.left = left;
			this.parentNode.drag.top = top;
			this.parentNode.drag.id = id;
		};
		template.querySelector('#pseudoBody').addEventListener('dragstart', drag_start);
		shadow.appendChild(template);

	}
};

Elements.load('dragElementTemplate.html', Elements.elements.DragElement, 'elements-drag-element');
