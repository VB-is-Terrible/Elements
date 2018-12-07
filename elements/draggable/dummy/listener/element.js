'use strict';

Elements.get();
{
const dataType = 'number/test';

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

		shadow.appendChild(template);
	}
	item_drag_start (caller, event) {
		let target = Elements.common.draggable_controller.registerResource(
			caller.firstElementChild);
		event.dataTransfer.setData(dataType, target);
		return;
	}
	item_drop (caller, event) {
		let resource_id = parseInt(event.dataTransfer.getData(dataType));
		let target = Elements.common.draggable_controller.retriveResource(resource_id);
		let drag_item = target.parentElement;
		let dropzone = this.querySelector('elements-draggable-container');
		dropzone.append(drag_item);
		console.log(target, event);
	}
};

Elements.load(Elements.elements.DraggableDummyListener, 'elements-draggable-dummy-listener');
};

main();
}
