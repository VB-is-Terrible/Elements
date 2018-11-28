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
		draggable.addEventListener('dragstart', (e) => {
			onDragStart(e);
		})
		shadow.appendChild(template);
		this.applyPriorProperty('context', null);
	}
	static get observedAttributes () {
		return ['context'];
	}
	onDragStart (e) {
		let valid = this.notify(e);
		if (!valid) {return;}
		Elements.common.draggable_controller.drag_start(this.context);
	}
};
Elements.load(Elements.elements.DraggableItem, 'elements-draggable-item');
};

main();
}
