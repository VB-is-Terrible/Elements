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
		this.touch = {
			left: 0,
			top: 0,
			touchID: 0,
		};
		this.events = {
			start: (e) => {self.touch_start(e);},
			end: (e) => {self.touch_end(e);},
			move: (e) => {self.touch_move(e);},
			dStart: (e) => {self.drag_start(e);},
			dEnd: (e) => {self.drag_end(e);},
			dMove: (e) => {self.drag_move(e);},
		};
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
	touch_start (event) {
		let touchEvent = event.changedTouches[0];
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let style = window.getComputedStyle(body, null);
		this.touch.touchID = touchEvent.identifier;
		this.touch.left = (parseInt(style.getPropertyValue("left"),10) - touchEvent.clientX)
		this.touch.top = (parseInt(style.getPropertyValue("top"),10) - touchEvent.clientY);
		body.addEventListener('touchmove', this.events.move, true);
		body.addEventListener('touchcancel', this.events.end, true);
		body.addEventListener('touchend', this.events.end, true);
		body.removeEventListener('touchstart', this.events.start, true);
		this.parentNode.toTop(this);
		this.parentNode.toBottom(this);
	}
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
	touch_end (event) {
		this.touch_reset();
	}
	touch_reset () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.addEventListener('touchstart', this.events.start, true);
		body.removeEventListener('touchmove', this.events.move, true);
		body.removeEventListener('touchend', this.events.end, true);
		body.removeEventListener('touchcancel', this.events.end, true);
	}
	drag_start (event) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let style = window.getComputedStyle(this.shadowRoot.querySelector('#pseudoBody'), null);
		let left = (parseInt(style.getPropertyValue("left"),10) - event.clientX).toString();
		let top = (parseInt(style.getPropertyValue("top"),10) - event.clientY).toString();
		let id = this.id;
		let data = left + ',' + top + ',' + id;
		this.drag.left = (parseInt(style.getPropertyValue("left"),10) - event.clientX)
		this.drag.top = (parseInt(style.getPropertyValue("top"),10) - event.clientY);
		this.parentNode.toTop(this);
		this.parentNode.toBottom(this);

		body.addEventListener('mousemove', this.events.dMove, true);
		body.addEventListener('mouseup', this.events.dEnd, true);
		body.removeEventListener('mousedown', this.events.dStart, true);
	}
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
	drag_reset () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.addEventListener('mousedown', this.events.dStart, true);
		body.removeEventListener('mousemove', this.events.dMove, true);
		body.removeEventListener('mouseup', this.events.dEnd, true);
	}
};

Elements.load('dragElementTemplate.html', Elements.elements.DragElement, 'elements-drag-element');
