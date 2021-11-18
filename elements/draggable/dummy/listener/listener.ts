import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {} from '../../../elements_helper.js';
import {draggable_controller} from '../../Common/Common.js'
import {ItemDragStartP2, ItemDrop, read_details} from '../../types.js';


const dataType = 'number/test';
const ELEMENT_NAME = 'DraggableDummyListener';

/**
 * [DraggableDummyListener Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
export class DraggableDummyListener extends backbone4 {
	constructor () {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(ELEMENT_NAME);

		shadow.appendChild(template);
		this.addEventListener('elements-item-drag-start2', (e) => {
			this.item_drag_start(e as CustomEvent);
		});
		this.addEventListener('elements-item-drop', (e) => {
			this.item_drop(e as CustomEvent);
		});
	}
	protected item_drag_start (event: CustomEvent<ItemDragStartP2>) {
		const details = read_details(event, ItemDragStartP2);
		let target = draggable_controller.registerResource(details.source);
		if (details.event.dataTransfer === null) {
			return;
		}
		details.event.dataTransfer.setData(dataType, target.toString());
		draggable_controller.setResource(details.rv, true);
		return;
	}
	protected item_drop (event: CustomEvent<ItemDrop>) {
		const details = read_details(event, ItemDrop);
		const drag_event = details.event;
		if (drag_event.dataTransfer === null) {
			return;
		}
		let resource_id = parseInt(drag_event.dataTransfer.getData(dataType));
		let target = draggable_controller.retriveResource(resource_id) as Element;
		(event.target! as HTMLElement).append(target);
		console.log(target, event);
		draggable_controller.setResource(details.rv, true);
	}
};

export default DraggableDummyListener;

Elements.load(DraggableDummyListener, 'elements-draggable-dummy-listener');
