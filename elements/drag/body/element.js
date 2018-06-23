'use strict';


/**
 * Interface for parents of drag-elements
 * @interface DragParent
 */
/**
 * @property {HTMLElement} subject
 * @description drag-element been dragged. This should be forwarded to a drag-body
 * @name DragParent.subject
 */
/**
 * @function topZIndex
 * @param {Node} childNode Node to raise
 * @description Raise a drag element above other drag-elements
 * @name DragParent.topZIndex
 */
/**
 * @function toBottom
 * @description Push the drag-body to the bottom. Used after a drag to allow access to other elements
 * @name DragParent.toBottom
 */
/**
 * @function toTop
 * @param {Node} childNode Node to place ontop of other nodes
 * @description Push childNode and dragBody to the top of z-Indexes
 * @name DragParent.toTop
 */

/**
 * DragBody
 * Designed to hold DragElements
 * Make sure internal elements are also draggable
 * @property {HTMLElement} subject drag-element been dragged
 * @implements DragParent
 * @augments Elements.elements.backbone2
 */
Elements.elements.DragBody = class extends Elements.elements.backbone2 {
	constructor () {
		super();

		const self = this;
		this.name = 'DragBody';
		this.subject = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.zIndexCount = parseInt(template.querySelector('#pseudoBody').style.zIndex) || 0;
		/**
		 * Wrapped event handlers.
		 * Used to mantian consistent calls to add/remove-EventListener
		 * @type {Object}
		 * @private
		 */
		this.callbacks = {
			move: (e) => {self.drag_move(e)},
			end: (e) => {self.drag_end(e)},
		};
		shadow.appendChild(template);
	}
	/**
	 * Updates a mouse based drag
	 * @param  {MouseEvent} event
	 * @private
	 */
	drag_move (event) {
		let target = this.subject;
		target.drag_move(event);
	}
	/**
 	 * Ends a mouse based drag
 	 * @param  {MouseEvent} event
 	 * @private
 	 */
	drag_end (event) {
		let target = this.subject;
		target.drag_end(event);
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
		body.addEventListener('mousemove', this.callbacks.move);
		body.addEventListener('mouseup', this.callbacks.end);

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
		body.removeEventListener('mousemove', this.callbacks.move);
		body.removeEventListener('mouseup', this.callbacks.end);
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

Elements.load(Elements.elements.DragBody, 'elements-drag-body');