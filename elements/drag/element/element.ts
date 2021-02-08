export const recommends = ['drag-body'];
export const requires = [];

import {Elements} from '../../elements_core.js';
import {backbone, backbone2, backbone4} from '../../elements_backbone.js';
import { applyPriorProperty } from '../../elements_helper.js';

type TouchListener = (arg0: TouchEvent) => void;
type MouseListener = (arg0: MouseEvent) => void;

const ELEMENT_NAME = 'DragElement';


interface dragged {
        readonly hidden: boolean;
        hideWindow: () => void;
        showWindow: () => void;
        centre: () => void;
        touch_reset: () => void;
        drag_reset: () => void;
        toTop: () => void;
}

const is_dragged = (object: any) => {
        if (typeof object.hidden !== 'boolean') {
                return false;
        } else if (typeof object.hideWindow !== 'function') {
                return false;
        } else if (typeof object.showWindow !== 'function') {
                return false;
        } else if (typeof object.centre !== 'function') {
                return false;
        } else if (typeof object.touch_reset !== 'function') {
                return false;
        } else if (typeof object.drag_reset !== 'function') {
                return false;
        } else if (typeof object.toTop !== 'function') {
                return false;
        }
        return true;
};


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

// TODO: Make this accept events
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
export class DragElement extends backbone4 implements dragged {
        private __animation: null | Animation;
        private __animationCallback: null | (() => void);
        private __animationState: null | string;
        touch: { left: number; top: number; touchID: number; };
        parent: null | (HTMLElement & dragged);
        drag: { left: number; top: number; };
        events: { start: TouchListener; end: TouchListener; move: TouchListener; dStart: MouseListener; dEnd: MouseListener; dMove: MouseListener; };
        private _body: HTMLDivElement;
	constructor () {
		super();

		const self = this;
		/**
		 * DragParent to chain to
		 * @type {DragParent}
		 */
		this.parent = null;
		applyPriorProperty(this, 'parent', null);
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

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(ELEMENT_NAME);

                this._body = template.querySelector('#pseudoBody') as HTMLDivElement;
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
			end: () => {self.touch_end();},
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
        // TODO: Annotate with types once dragbody is done
	get __parent (): HTMLElement {
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
	touch_start (event: TouchEvent) {
		let touchEvent = event.changedTouches[0];
		let body = this._body;
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
	touch_move (event: TouchEvent) {
		for (let touch of event.changedTouches) {
			if (touch.identifier === this.touch.touchID) {
				if (event.cancelable) {
					event.preventDefault();
				}
				let leftStyle = touch.clientX + this.touch.left;
				let topStyle = touch.clientY + this.touch.top;
				this.setTop(topStyle);
				this.setLeft(leftStyle);
				return;
			}
		}
	}
	/**
	 * Ends a touch based drag
	 * @param  {TouchEvent} event
	 * @private
	 */
	touch_end () {
		this.touch_reset();
	}
	/**
	 * Resets/Cancels a touch drag.
	 * As touchs don't bubble along the DOM, use this instead of preventDefault/stopPropagation
	 */
	touch_reset () {
		let body = this._body;
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
	drag_start (event: MouseEvent) {
		// event.preventDefault();
		let body = this._body;
		let style = window.getComputedStyle(body, null);
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
	drag_move (event: MouseEvent) {
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
	drag_end (event: MouseEvent) {
		event.preventDefault();
		let body = this._body;
		body.addEventListener('mousedown', this.events.dStart, false);
		body.removeEventListener('mousemove', this.events.dMove, false);
		body.removeEventListener('mouseup', this.events.dEnd, false);
		this.__parent.toBottom();
	}
	/**
	 * Reset/Cancel a drag
	 */
	drag_reset () {
		let body = this._body;
		body.removeEventListener('mousedown', this.events.dStart, false);
		body.addEventListener('mousedown', this.events.dStart, false);
		body.removeEventListener('mousemove', this.events.dMove, false);
		body.removeEventListener('mouseup', this.events.dEnd, false);
	}
	/**
	 * Moves drag-element to the centre of the window
	 */
	centre () {
		let body = this._body;
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
				case 'show':
					return false;
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
		let body = this._body;
		// If the element is hiding, do nothing
		if (this.__animationState === 'hide') {
			return;
		} else if (this.__animationState === null && this.hidden) {
			return;
		} else {
			this.__animationState = 'hide';
		}

		let callback = () => {
			requestAnimationFrame(() => {
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
		let body = this._body;
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
	setTop (value: number) {
		let body = this._body;
		requestAnimationFrame(() => {
			body.style.top = value.toString() + 'px';
		});
	}
	/**
	 * Sets the left css property of pseudoBody.
	 * This would normally be done through custom css properties, but that
	 * causes really long style recalculations
	 * @param {Number} value What to set left to
	 */
	setLeft (value: number) {
		let body = this._body;
		requestAnimationFrame(() => {
			body.style.left = value.toString() + 'px';
		});
	}
        /**
         * Disables dragging of this element
         * For use in testing
         */
        disable () {
                let body = this._body;
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

// TODO: Make these fire events instead of parent chaining
/**
 * Implements commonly used methods for things been dragged
 * @type {Object}
 * @property {Boolean} hidden Wheter this element is hidden
 * @property {Draggable} parent Element to chain [show/hide]Window, etc. calls to. Defaults to parentElement
 * @augments Elements.elements.backbone
 * @implements Draggable
 */
Elements.elements.dragged = class extends backbone implements dragged {
        parent: HTMLElement | null;
	constructor () {
		super();
                //@ts-ignore
		this.parent = this.parent || null;
	}
	get hidden () {
		return this._parent.hidden;
	}
	/**
	 * Hide this element
	 */
	hideWindow () {
                this._parent.hideWindow();
	}
	/**
	 * Unhide this element
	 */
	showWindow () {
		this._parent.showWindow();
	}
	/**
	 * Centre the element onscreen
	 */
	centre () {
		this._parent.centre();
	}
	/**
	 * Resets/Cancels a touch drag.
	 * As touchs don't bubble along the DOM, use this instead of preventDefault/stopPropagation
	 */
	touch_reset () {
		this._parent.touch_reset();
	}
	/**
	 * Reset/Cancel a drag. For completness
	 */
	drag_reset () {
		this._parent.drag_reset();
	}
	/**
	 * Push the drag element to the top
	 */
	toTop () {
		this._parent.toTop();
	}
        private get _parent(): dragged & HTMLElement {
                let parent;
                if (this.parent === null) {
                        parent = this.parentElement;
                } else {
                        parent = this.parent;
                }
                if (parent === null) {
                        throw new Error('Draggable object is not in a drag-element');
                }
                if (!is_dragged(parent)) {
                        throw new Error('Draggable object is not in a drag-element chain')
                }
                return parent as dragged & HTMLElement;
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
Elements.elements.dragged2 = class dragged2 extends backbone2 implements dragged {
        parent: null;
	constructor () {
		super();
		this.applyPriorProperty('parent', null);
	}
        get hidden () {
		return this._parent.hidden;
	}
	/**
	 * Hide this element
	 */
	hideWindow () {
                this._parent.hideWindow();
	}
	/**
	 * Unhide this element
	 */
	showWindow () {
		this._parent.showWindow();
	}
	/**
	 * Centre the element onscreen
	 */
	centre () {
		this._parent.centre();
	}
	/**
	 * Resets/Cancels a touch drag.
	 * As touchs don't bubble along the DOM, use this instead of preventDefault/stopPropagation
	 */
	touch_reset () {
		this._parent.touch_reset();
	}
	/**
	 * Reset/Cancel a drag. For completness
	 */
	drag_reset () {
		this._parent.drag_reset();
	}
	/**
	 * Push the drag element to the top
	 */
	toTop () {
		this._parent.toTop();
	}
        private get _parent(): dragged & HTMLElement {
                let parent;
                if (this.parent === null) {
                        parent = this.parentElement;
                } else {
                        parent = this.parent;
                }
                if (parent === null) {
                        throw new Error('Draggable object is not in a drag-element');
                }
                if (!is_dragged(parent)) {
                        throw new Error('Draggable object is not in a drag-element chain')
                }
                return parent as dragged & HTMLElement;
        }
}

// TODO: Make a mixin for backbone4

Elements.load(DragElement, 'elements-drag-element');
