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

		let draggable = template.querySelector('#draggable');
		let f = (e) => {
			self.onDragStart(e);
		};
		draggable.addEventListener('dragstart', f)
		shadow.appendChild(template);
		this.applyPriorProperty('context', null);
	}
	static get observedAttributes () {
		return ['context'];
	}
	onDragStart (e) {
		e.dataTransfer.setData('text/plain', null);
		this.notify(e);
		Elements.common.draggable_controller.drag_start(this.context);
		// console.log(e);
	}
	notify (e) {
		let parent = this._get_parent();
		if (parent === null) {
			// Not setting dataTransfer automatically cancels drag
			throw new Error('Could not find parent to notify of drag');
		}
		parent.item_drag_start(this, e);
	}
	_get_parent () {
		let parent = this.parentElement;
		while (parent !== null && !this.constructor._check_parent(parent)) {
			parent = parent.parentElement;
		}
		return parent;
	}
	static _check_parent (parent) {
		if (!(typeof parent.item_drag_start === 'function')) {
			return false;
		}
		return true;
	}
};
Elements.load(Elements.elements.DraggableItem, 'elements-draggable-item');
};

main();
}
