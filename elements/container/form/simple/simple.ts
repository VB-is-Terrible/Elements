const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {CustomComposedEvent} from '../../../elements_helper.js';
import {accept_event_string, reset_event_string} from '../Common.js'

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'ContainerFormSimple';
/**
 * A simple form container, with basic layout + buttons
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 * @fires 'elements-from-simple-reset'
 * @fires 'elements-from-simple-accept'
 * @fires 'dialog-close'
 */
export class ContainerFormSimple extends backbone4 {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		const close = template.querySelector('button.title_close') as HTMLButtonElement;
		close.addEventListener('click', () => {
			this.close();
		});
		const cancel = template.querySelector('#cancel') as HTMLButtonElement;
		const accept = template.querySelector('#accept') as HTMLButtonElement;
		cancel.addEventListener('click', () => {
			this.reset();
			this.close();
		});
		accept.addEventListener('click', () => {
			this.accept();
			this.close();
		});

		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return [];
	}
	reset() {
		const ev = CustomComposedEvent(reset_event_string);
		this.dispatchEvent(ev);
	}
	accept() {
		const ev = CustomComposedEvent(accept_event_string);
		this.dispatchEvent(ev);
	}
	close() {
		const ev = CustomComposedEvent('dialog_close');
		this.dispatchEvent(ev);
	}

}

export default ContainerFormSimple;

Elements.load(ContainerFormSimple, 'elements-container-form-simple');
