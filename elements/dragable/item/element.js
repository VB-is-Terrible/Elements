'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [DragableItem Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.DragableItem = class DragableItem extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'DragableItem';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
};

Elements.load(Elements.elements.DragableItem, 'elements-dragable-item');
};

main();
}
