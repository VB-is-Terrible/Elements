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
 * @name Draggable.showWindow
 */
/**
 * @function centre
 * @description Place the draggable on the screen centre
 * @name Draggable.hideWindow
 */

Elements.get('drag-body');
{
/**
 * DragElement
 * Designed to hold contents to be dragged.
 * Must be placed within a DragBody.
 * Use touch_reset & event.stopPropagation to stop a touch based drag
 * Use event.stopPropagation to stop a mouse based drag
 * Internal stages:
 * touch_start -> touch_move -> touch_end
 * drag_start -> drag_move (drag over) -> drag_end (drag drop, found in drag-body)
 * @property {boolean} hidden Wheter this element is hidden
 * @property {DragParent} parent DragParent to chain to
 * @augments Elements.elements.backbone2
 * @implements Draggable
 */
Elements.elements.DragElement = class DragElement extends Elements.elements.backbone2 {
	constructor () {
		super();

		const self = this;
		this.name = 'DragElement';
		/**
		 * DragParent to chain to
		 * @type {DragParent}
		 */
		this.parent = null;
		this.applyPriorProperty('parent', null);
		/**
		 * The currently playing animation
		 * @type {Animation}
		 * @private
		 */
		this.__animation = null;
		/**
		 * Function to call on animation finish.
		 * Overriding Animation.onfinish doesn't cancel previous onfinishs (promises)
		 * so indirect the call to something that can be overridden
		 * @type {Function}
		 * @private
		 */
		this.__animationCallback = null;
		/**
		 * Current animation state, either 'show' or 'hide'
		 * @type {String}
		 * @private
		 */
		this.__animationState = null;
		/**
		 * Temp value for pseudoBody.style.left before its set in a animation frame
		 * @type {?Number}
		 * @private
		 */
		this.__left = null;
		/**
		 * Temp value for pseudoBody.style.top before its set in a animation frame
		 * @type {?Number}
		 * @private
		 */
		this.__top = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		shadow.appendChild(template);
		/**
		 * Touch event data
		 * @type {Object}
		 * @property {Number} left Offset of touch event from the left edge
		 * @property {Number} top Offset of touch event from the top edge
		 * @property {Number} touchID ID of the touch event that triggered the drag
		 * @private
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
		 * @private
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
		 * @private
		 */
		this.drag = {
			left: 0,
			top: 0,
		};
	}
	/**
	 * this.parent or if parent is null parentNode
	 * @return {DragParent} DragParent to chain calls to
	 * @private
	 */
	get __parent () {
		if (this.parent === null) {
			return this.parentNode;
		} else {
			return this.parent;
		}
	}
	connectedCallback () {
		super.connectedCallback();
		this.touch_reset();
		this.drag_reset();
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
		this.touch.left = (parseInt(style.getPropertyValue('left'),10) - touchEvent.clientX);
		this.touch.top = (parseInt(style.getPropertyValue('top'),10) - touchEvent.clientY);
		body.addEventListener('touchmove', this.events.move, false);
		body.addEventListener('touchcancel', this.events.end, false);
		body.addEventListener('touchend', this.events.end, false);
		body.removeEventListener('touchstart', this.events.start, false);
		this.__parent.topZIndex(this);
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
				if (event.cancelable) {
					event.preventDefault();
				}
				let leftStyle = touch.clientX + this.touch.left;
				let topStyle = touch.clientY + this.touch.top;
				this.setTop(topStyle);
				this.setLeft(leftStyle);
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
	 * @param  {MouseEvent} event
	 */
	drag_start (event) {
		// event.preventDefault();
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let style = window.getComputedStyle(this.shadowRoot.querySelector('#pseudoBody'), null);
		let left = (parseInt(style.getPropertyValue('left'),10) - event.clientX).toString();
		let top = (parseInt(style.getPropertyValue('top'),10) - event.clientY).toString();
		let id = this.id;
		let data = left + ',' + top + ',' + id;
		this.drag.left = (parseInt(style.getPropertyValue('left'),10) - event.clientX);
		this.drag.top = (parseInt(style.getPropertyValue('top'),10) - event.clientY);
		this.__parent.toTop(this);
		this.__parent.subject = this;
		body.addEventListener('mousemove', this.events.dMove, false);
		body.addEventListener('mouseup', this.events.dEnd, false);
		body.removeEventListener('mousedown', this.events.dStart, false);
	}
	/**
	 * Updates a mouse based drag
	 * @param  {MouseEvent} event
	 */
	drag_move (event) {
		event.preventDefault();
		let leftStyle = event.clientX + this.drag.left;
		let topStyle = event.clientY + this.drag.top;
		this.setTop(topStyle);
		this.setLeft(leftStyle);
		return false;
	}
	/**
	 * Ends a mouse based drag
	 * @param  {MouseEvent} [event]
	 */
	drag_end (event) {
		event.preventDefault();
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.addEventListener('mousedown', this.events.dStart, false);
		body.removeEventListener('mousemove', this.events.dMove, false);
		body.removeEventListener('mouseup', this.events.dEnd, false);
		this.__parent.toBottom();
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
		this.setTop(top);
		this.setLeft(left);
	}
	/**
	 * Put this drag-element on top of other drag-elements
	 */
	toTop () {
		this.__parent.topZIndex(this);
	}
	get hidden () {
		let computed = getComputedStyle(this);
		if (this.__animationState !== null) {
			switch (this.__animationState) {
				case 'hide':
					return true;
					break;
				case 'show':
					return false;
					break;
				default:
					console.error('Bad animation state', this.__animationState);
			}
		}
		if (computed.display === 'none' || computed.visibility === 'hidden') {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * Run the animation onfinish callback, then reset animation state
	 * @private
	 */
	animation_onfinish () {
		if (this.__animationCallback !== null) {
			this.__animationCallback();
		}
		this.__animationCallback = null;
		this.__animation = null;
		this.__animationState = null;
	}
	/**
	 * Hide this element
	 */
	hideWindow () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		// If the element is hiding, do nothing
		if (this.__animationState === 'hide') {
			return;
		} else if (this.__animationState === null && this.hidden) {
			return;
		} else {
			this.__animationState = 'hide';
		}

		let callback = () => {
			requestAnimationFrame((e) => {
				this.style.visibility = 'hidden';
			});
		}
		// If the element is been shown, reverse it
		if (this.__animation !== null) {
			this.__animation.reverse();
			this.__animationCallback = callback;
			return;
		}
		// Else, start a new animation
		let translate = 'translate(0px, ' + Elements.animation.DROP_AMOUNT.toString() + 'px)';
		this.__animation = body.animate([{
			opacity: 1,
			transform: 'translate(0px, 0px)',
		}, {
			opacity: 0,
			transform: translate,
		}], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		this.__animation.onfinish = () => {
			this.animation_onfinish();
		};
		this.__animationCallback = callback;
	}
	/**
	 * Unhide this element
	 */
	showWindow () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		// If the element is hiding, do nothing
		if (this.__animationState === 'show') {
			return;
		} else if (this.__animationState === null && !this.hidden) {
			return;
		} else {
			this.__animationState = 'show';
		}
		// If the element is been shown, reverse it
		if (this.__animation !== null) {
			this.__animation.reverse();
			this.__animationCallback = () => {};
			return;
		}
		// Else, start a new animation
		requestAnimationFrame(() => {
			this.style.display = 'block';
			this.style.visibility = 'visible';
		});
		let translate = 'translate(0px, ' + Elements.animation.DROP_AMOUNT.toString() + 'px)';
		this.__animation = body.animate([{
			opacity: 0,
			transform: translate,
		}, {
			opacity: 1,
			transform: 'translate(0px, 0px)',
		}], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		this.__animation.onfinish = () => {
			this.animation_onfinish();
		};

		this.toTop();
	}
	/**
	 * Sets the top css property of pseudoBody.
	 * This would normally be done through custom css properties, but that
	 * causes really long style recalculations
	 * @param {Number} value What to set top to
	 */
	setTop (value) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		this.__top = value;
		requestAnimationFrame((e) => {
			body.style.top = value.toString() + 'px';
			this.__top = null;
		});
	}
	/**
	 * Sets the left css property of pseudoBody.
	 * This would normally be done through custom css properties, but that
	 * causes really long style recalculations
	 * @param {Number} value What to set left to
	 */
	setLeft (value) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		this.__left = value;
		requestAnimationFrame((e) => {
			body.style.left = value.toString() + 'px';
			this.__left = null;
		});
	}
        /**
         * Disables dragging of this element
         * For use in testing
         */
        disable () {
                let body = this.shadowRoot.querySelector('#pseudoBody');
                body.removeEventListener('mousedown', this.events.dStart, false);
		body.removeEventListener('mousedown', this.events.dStart, false);
		body.removeEventListener('mousemove', this.events.dMove, false);
		body.removeEventListener('mouseup', this.events.dEnd, false);
                body.removeEventListener('touchstart', this.events.start, false);
		body.removeEventListener('touchmove', this.events.move, false);
		body.removeEventListener('touchend', this.events.end, false);
		body.removeEventListener('touchcancel', this.events.end, false);
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
	/**
	 * Push the drag element to the top
	 */
	toTop () {
		if (this.parent === null) {
			this.parentElement.toTop();
		} else {
			this.parent.toTop();
		}
	}
}

/**
 * Implements commonly used methods for things been dragged
 * @type {Object}
 * @property {Boolean} hidden Wheter this element is hidden
 * @property {Draggable} parent Element to chain [show/hide]Window, etc. calls to. Defaults to parentElement
 * @implements Draggable
 * @augments Elements.elements.backbone2
 * @name Elements.elements.dragged2
 */
Elements.elements.dragged2 = class dragged2 extends Elements.elements.backbone2 {
	constructor () {
		super();
		this.applyPriorProperty('parent', null);
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
	/**
	 * Push the drag element to the top
	 */
	toTop () {
		if (this.parent === null) {
			this.parentElement.toTop();
		} else {
			this.parent.toTop();
		}
	}
}
}

Elements.load(Elements.elements.DragElement, 'elements-drag-element');
