'use strict';

/**
 * Interface for things that go in drag-elements
 * @interface Draggable
 */
/**
 * @property {Boolean} hidden
 * @description If the draggable is hidden
 * @name Draggable.hidden
 */
/**
 * @property {Draggable} parent
 * @description IF the draggable does not directly implement the methods: Element to chain [show/hide]Window, etc. calls to. Defaults to parentElement
 * @name Draggable.parent
 */
/**
 * @function hideWindow
 * @description Hide the draggable
 * @name Draggable.hideWindow
 */
/**
 * @function showWindow
 * @description Unhide the draggable
 * @name KerbalDisplay.showWindow
 */
/**
 * @function centre
 * @description Place the draggable on the screen centre
 * @name Draggable.hideWindow
 */


Elements.get('drag-body');
/**
 * DragElement
 * Designed to hold contents to be dragged.
 * Must be placed within a DragBody.
 * Use touch_reset/drag_reset to stop a touch/mouse based drag
 * Internal stages:
 * touch_start -> touch_move -> touch_end
 * drag_start -> drag_move (drag over) -> drag_end (drag drop, found in drag-body)
 * @property {boolean} hidden Wheter this element is hidden
 * @implements Draggable
 */
Elements.elements.DragElement = class extends Elements.elements.backbone {
	constructor () {
		super();

		const self = this;
		this.name = 'DragElement';
		this.parent = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let drag_start = (event) => {
			// Pushing the element been dragged and the drag body to the
			// top of the z-indexes is probably a good idea
			let style = window.getComputedStyle(self.shadowRoot.querySelector('#pseudoBody'), null);
			let left = (parseInt(style.getPropertyValue('left'),10) - event.clientX).toString();
			let top = (parseInt(style.getPropertyValue('top'),10) - event.clientY).toString();
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
		/**
		 * Touch event data
		 * @type {Object}
		 * @property {Number} left Offset of touch event from the left edge
		 * @property {Number} top Offset of touch event from the top edge
		 * @property {Number} touchID ID of the touch event that triggered the drag
		 */
		this.touch = {
			left: 0,
			top: 0,
			touchID: 0,
		};
		/**
		 * Wrapped event handlers.
		 * Used to mantian consistent calls to add/remove-EventListener
		 * @type {Object}
		 */
		this.events = {
			start: (e) => {self.touch_start(e);},
			end: (e) => {self.touch_end(e);},
			move: (e) => {self.touch_move(e);},
			dStart: (e) => {self.drag_start(e);},
			dEnd: (e) => {self.drag_end(e);},
			dMove: (e) => {self.drag_move(e);},
		};
		/**
		 * Drag event data
		 * @type {Object}
		 * @property {Number} left Offset of touch event from the left edge
		 * @property {Number} top Offset of touch event from the top edge
		 */
		this.drag = {
			left: 0,
			top: 0,
		};
	}
	connectedCallback () {
		super.connectedCallback();
		this.touch_reset();
		// this.drag_reset();
	}
	/**
	 * Starts a touch based drag
	 * @param  {TouchEvent} event
	 * @private
	 */
	touch_start (event) {
		let touchEvent = event.changedTouches[0];
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let style = window.getComputedStyle(body, null);
		this.touch.touchID = touchEvent.identifier;
		this.touch.left = (parseInt(style.getPropertyValue('left'),10) - touchEvent.clientX)
		this.touch.top = (parseInt(style.getPropertyValue('top'),10) - touchEvent.clientY);
		body.addEventListener('touchmove', this.events.move, false);
		body.addEventListener('touchcancel', this.events.end, false);
		body.addEventListener('touchend', this.events.end, false);
		body.removeEventListener('touchstart', this.events.start, false);
		this.parentNode.topZIndex(this);
	}
	/**
	 * Updates a touch based drag
	 * @param  {TouchEvent} event
	 * @private
	 */
	touch_move (event) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		for (let touch of event.changedTouches) {
			if (touch.identifier === this.touch.touchID) {
				event.preventDefault();
				let leftStyle = (touch.clientX + this.touch.left).toString() + 'px';
				let topStyle = (touch.clientY + this.touch.top).toString() + 'px';
				requestAnimationFrame(() => {
					// target.style.top = topStyle;
					this.style.setProperty('--top', topStyle);
					// target.style.left = leftStyle;
					this.style.setProperty('--left', leftStyle);
					// this.toBottom();
				});
				return false;
			}
		}
	}
	/**
	 * Ends a touch based drag
	 * @param  {TouchEvent} event
	 * @private
	 */
	touch_end (event) {
		this.touch_reset();
	}
	/**
	 * Resets/Cancels a touch drag.
	 * As touchs don't bubble along the DOM, use this instead of preventDefault/stopPropagation
	 */
	touch_reset () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.removeEventListener('touchstart', this.events.start, false);
		body.addEventListener('touchstart', this.events.start, false);
		body.removeEventListener('touchmove', this.events.move, false);
		body.removeEventListener('touchend', this.events.end, false);
		body.removeEventListener('touchcancel', this.events.end, false);
	}
	/**
	 * Starts a mouse base drag
	 * @param  {DragEvent} event
	 * @private
	 */
	drag_start (event) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let style = window.getComputedStyle(this.shadowRoot.querySelector('#pseudoBody'), null);
		let left = (parseInt(style.getPropertyValue('left'),10) - event.clientX).toString();
		let top = (parseInt(style.getPropertyValue('top'),10) - event.clientY).toString();
		let id = this.id;
		let data = left + ',' + top + ',' + id;
		this.drag.left = (parseInt(style.getPropertyValue('left'),10) - event.clientX)
		this.drag.top = (parseInt(style.getPropertyValue('top'),10) - event.clientY);
		this.parentNode.topZIndex(this);

		body.addEventListener('mousemove', this.events.dMove, false);
		body.addEventListener('mouseup', this.events.dEnd, false);
		body.removeEventListener('mousedown', this.events.dStart, false);
	}
	/**
	 * Updates a mouse based drag
	 * @param  {DragEvent} event
	 * @private
	 */
	drag_move (event) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		event.preventDefault();
		let leftStyle = (event.clientX + this.drag.left).toString() + 'px';
		let topStyle = (event.clientY + this.drag.top).toString() + 'px';
		requestAnimationFrame(() => {
			// target.style.top = topStyle;
			this.style.setProperty('--top', topStyle);
			// target.style.left = leftStyle;
			this.style.setProperty('--left', leftStyle);
			// this.toBottom();
		});
		return false;
	}
	drag_end (event) {
		this.drag_reset();
	}
	/**
	 * Reset/Cancel a drag
	 */
	drag_reset () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.removeEventListener('mousedown', this.events.dStart, false);
		body.addEventListener('mousedown', this.events.dStart, false);
		body.removeEventListener('mousemove', this.events.dMove, false);
		body.removeEventListener('mouseup', this.events.dEnd, false);
	}
	/**
	 * Moves drag-element to the centre of the window
	 */
	centre () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let height = body.offsetHeight;
		let width = body.offsetWidth;
		let top = (window.innerHeight - height) / 2;
		let left = (window.innerWidth - width) / 2;
		requestAnimationFrame(() => {
			this.style.setProperty('--top', top.toString() + 'px');
			this.style.setProperty('--left', left.toString() + 'px');
		});
	}
	/**
	 * Put this drag-element on top of other drag-elements
	 */
	toTop () {
		this.parentNode.topZIndex(this);
	}
	get hidden () {
		let computed = getComputedStyle(this);
		if (computed.display === 'none' || computed.visibility === 'hidden') {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * Hide this element
	 */
	hideWindow () {
		requestAnimationFrame(() => {
			this.style.visibility = 'hidden';
		});
	}
	/**
	 * Unhide this element
	 */
	showWindow () {
		requestAnimationFrame(() => {
			this.style.display = 'block';
			this.style.visibility = 'visible';
		});
		this.toTop();
	}
};

/**
 * Implements commonly used methods for things been dragged
 * @type {Object}
 * @property {Boolean} hidden Wheter this element is hidden
 * @property {Draggable} parent Element to chain [show/hide]Window, etc. calls to. Defaults to parentElement
 * @augments Elements.elements.backbone
 * @implements Draggable
 */
Elements.elements.dragged = class extends Elements.elements.backbone {
	constructor () {
		super();
		this.parent = this.parent || null;
	}
	get hidden () {
		if (this.parent === null) {
			return this.parentElement.hidden;
		} else {
			return this.parent.hidden;
		}
	}
	/**
	 * Hide this element
	 */
	hideWindow () {
		if (this.parent === null) {
			this.parentElement.hideWindow();
		} else {
			this.parent.hideWindow();
		}
	}
	/**
	 * Unhide this element
	 */
	showWindow () {
		if (this.parent === null) {
			this.parentElement.showWindow();
		} else {
			this.parent.showWindow();
		}
	}
	/**
	 * Centre the element onscreen
	 */
	centre () {
		if (this.parent === null) {
			this.parentElement.centre();
		} else {
			this.parent.centre();
		}
	}
	/**
	 * Resets/Cancels a touch drag.
	 * As touchs don't bubble along the DOM, use this instead of preventDefault/stopPropagation
	 */
	touch_reset () {
		if (this.parent === null) {
			this.parentElement.touch_reset();
		} else {
			this.parent.touch_reset();
		}
	}
	/**
	 * Reset/Cancel a drag. For completness
	 */
	drag_reset () {
		if (this.parent === null) {
			this.parentElement.drag_reset();
		} else {
			this.parent.drag_reset();
		}
	}
}
Elements.load('dragElementTemplate.html', Elements.elements.DragElement, 'elements-drag-element');
