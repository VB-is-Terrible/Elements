'use strict'

/**
 * DragBody
 * Designed to hold DragElements
 * Make sure internal elements are also draggable
 */
Elements.elements.DragBody = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.name = 'DragBody';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.zIndexCount = template.querySelector('#pseudoBody').style.zIndex;

		let drag_over = (event) => {
			event.preventDefault();
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
			console.log(left, top);
			let leftStyle = (event.clientX + left) + 'px';
			let topStyle = (event.clientY + top) + 'px';
			// target.style.top = topStyle;
			target.style.setProperty('--top', topStyle);
			// target.style.left = leftStyle;
			target.style.setProperty('--left', leftStyle);
			this.toBottom();
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
		this.zIndexCount += 1;
		childNode.style.zIndex = this.zIndexCount;
		// Place pseudoBody on top of everything else
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.style.width = window.innerWidth + 'px';
		body.style.height = window.innerHeight + 'px';
	}
	toBottom () {
		// Place pseudoBody out of the way
		// The high z-index is needed to keep child elements on top
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.style.width = '0px';
		body.style.height = '0px';

	}
};

Elements.load('dragBodyTemplate.html', Elements.elements.DragBody, 'elements-drag-body');