'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [DraggableDummyListener Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.DraggableDummyListener = class DraggableDummyListener extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'DraggableDummyListener';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
	item_drag_start (caller, event) {
		let target = Elements.common.draggable_controller.registerResource(
			caller.firstElementChild);
		// event.dataTransfer.setData('number/test');
		return;
	}
};

Elements.load(Elements.elements.DraggableDummyListener, 'elements-draggable-dummy-listener');
};

main();
}
