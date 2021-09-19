const recommends: Array<string> = [];
const requires: Array<string> = ['draggable-container'];

import {Elements} from '../../../elements_core.js';
import {} from '../../../elements_backbone.js';
import {CustomComposedEvent} from '../../../elements_helper.js';
import {DraggableContainer} from '../../../draggable/container/container.js';
import {read_details} from '../../../draggable/types.js';
import {draggable_controller} from '../../../draggable/Common/Common.js';
import {Projects3DragStart, Projects3Drop, Projects3DragTransfer, id} from '../../Common/Common.js';


Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects3ProjectgroupDisplay'

export const transfer_datatype = 'number/projects3drop';

/**
 * [Projects3ProjectgroupDisplay Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects3ProjectgroupDisplay extends DraggableContainer {
	project_id: id = -1;
	constructor () {
		super();

		const template = Elements.importTemplate(ELEMENT_NAME);
		this.shadowRoot!.append(template);
	}
	protected on_drag (event: CustomEvent): boolean {
		const details_old = read_details(event, Projects3DragStart);
		const details_new = new Projects3DragTransfer(details_old.source_id, this.project_id);
		details_old.event.dataTransfer!.setData(transfer_datatype, draggable_controller.registerResource(details_new).toString());
		return true;
	}
	protected on_drop (event: DragEvent) {
		if (event.dataTransfer === null) {
			return
		}
		const start_data = draggable_controller.retriveResource(parseInt(event.dataTransfer.getData(transfer_datatype))) as Projects3DragTransfer;
		const details = new Projects3Drop(start_data.source_id, start_data.group_id, this.project_id);
		this.dispatchEvent(CustomComposedEvent(Projects3Drop.event_string, details));
		console.log(details);
	}
}

export default Projects3ProjectgroupDisplay;

Elements.load(Projects3ProjectgroupDisplay, 'elements-projects3-projectgroup-display');
