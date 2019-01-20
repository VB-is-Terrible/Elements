'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [DraggableItem Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.DraggableItem = class DraggableItem extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'DraggableItem';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		this._context = null;
		// Set up attribute - property reflection
		Elements.setUpAttrPropertyLink2(this, 'context');

		this.events = {
			start: (e) => {self.onDragStart(e);},
			end: (e) => {self.onDragEnd(e);},
			test: (e) => {self.onTouchStart(e);},
		};
		shadow.appendChild(template);
		this._end_drag();
		this.applyPriorProperty('context', null);
	}
	static get observedAttributes () {
		return ['context'];
	}
	onDragStart (e) {
		let effectAllowed = this.notify(e);
		e.dataTransfer.setData('text/plain', null);
		Elements.common.draggable_controller.drag_start(this.context, effectAllowed);
		this._begin_drag();
		console.log(e);
	}
	notify (event) {
		let parent = Elements.classes.Draggable.getParent(this);
		if (parent === null) {
			// Not setting dataTransfer automatically cancels drag
			// preventDefault is needed for chrome
			event.preventDefault();
			throw new Error('Could not find parent to notify of drag');
		}
		return parent.item_drag_start(this, event);
	}
	onDragEnd (event) {
		// Don't think there is anything that needs notifying
		Elements.common.draggable_controller.drag_end(this.context);
		this._end_drag();
	}
	_end_drag () {
		let draggable = this.shadowRoot.querySelector('#draggable');
		draggable.addEventListener('dragstart', this.events.start);
		draggable.removeEventListener('dragend', this.events.end);
		if (!this.attributeInit) {
			draggable.addEventListener('touchstart', this.events.test);
		}
	}
	_begin_drag () {
		let draggable = this.shadowRoot.querySelector('#draggable');
		draggable.removeEventListener('dragstart', this.events.start);
		draggable.addEventListener('dragend', this.events.end);
	}
	onTouchStart () {
	}
};
Elements.load(Elements.elements.DraggableItem, 'elements-draggable-item');
};

main();
}
