'use strict';

/**
 * DragBody
 * Designed to hold DragElements
 * Make sure internal elements are also draggable
 */
Elements.elements.DragBody = class extends Elements.elements.backbone {
	constructor () {
		super();

		const self = this;
		this.name = 'DragBody';
		this.drag = {
			left: 0,
			top: 0,
			id: '',
		};
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.zIndexCount = parseInt(template.querySelector('#pseudoBody').style.zIndex) || 0;

		let drag_over = (event) => {
			event.preventDefault();
			let target = document.getElementById(self.drag.id);
			let leftStyle = (event.clientX + parseInt(self.drag.left)) + 'px';
			let topStyle = (event.clientY + parseInt(self.drag.top)) + 'px';
			requestAnimationFrame(() => {
				// target.style.top = topStyle;
				target.style.setProperty('--top', topStyle);
				// target.style.left = leftStyle;
				target.style.setProperty('--left', leftStyle);
				// this.toBottom();
			});
			return false;
		};

		this.addEventListener('dragover', drag_over);

		let decodeData = (dataString) => {
			let split = dataString.split(',');
			let result = ['0px','0px', null];
			result[0] = parseInt(split[0]);
			result[1] = parseInt(split[1]);
			result[2] = split[2];
			return result;
			return ['0px','0px', null];
		};

		let drag_end = (event) => {
			let [left, top, id] = decodeData(event.dataTransfer.getData('text/plain'));
			let target = document.getElementById(id);
			let leftStyle = (event.clientX + left) + 'px';
			let topStyle = (event.clientY + top) + 'px';
			// target.style.top = topStyle;
			target.style.setProperty('--top', topStyle);
			// target.style.left = leftStyle;
			target.style.setProperty('--left', leftStyle);
			self.toBottom();
			event.preventDefault();
			return false;
		}
		this.addEventListener('drop', drag_end);
		shadow.appendChild(template);
	}
	/**
	 * Push childNode and dragBody to the top of z-Indexes
	 * @param  {Node} childNode Node to place ontop of other nodes
	 */
	toTop (childNode) {
		// Place childNode on top of other floating elements
		this.topZIndex(childNode);
		// Place pseudoBody on top of everything else
		let body = this.shadowRoot.querySelector('#pseudoBody');
		requestAnimationFrame((e) => {
			body.style.width = window.innerWidth + 'px';
			body.style.height = window.innerHeight + 'px';
		});
	}
	/**
	 * Push the drag-body to the bottom.
	 * Used after a drag to allow access to other elements
	 */
	toBottom () {
		// Place pseudoBody out of the way
		// The high z-index is needed to keep child elements on top
		let body = this.shadowRoot.querySelector('#pseudoBody');
		requestAnimationFrame((e) => {
			body.style.width = '0px';
			body.style.height = '0px';
		});
	}
	/**
	 * Get a empty element to display in the drag image
	 * @private
	 */
	getDragImage () {
		return this.shadowRoot.querySelector('#empty');
	}
	/**
	 * Raise a drag element above other drag elements
	 * @param  {Node} childNode Node to raise
	 */
	topZIndex (childNode) {
		this.zIndexCount += 1;
		let index = this.zIndexCount;
		requestAnimationFrame((e) => {
			childNode.style.zIndex = this.zIndexCount.toString();
		});
	}
};

Elements.load('dragBodyTemplate.html', Elements.elements.DragBody, 'elements-drag-body');
