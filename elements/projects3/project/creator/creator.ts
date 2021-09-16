const recommends: Array<string> = ['container-form-simple'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {CustomComposedEvent} from '../../../elements_helper.js';
import {FormWrapper} from '../../../container/form/Common.js';
import {ProjectObj} from '../../Common.js';



Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects3ProjectCreator';

export const accept_event_string = 'elements-project3-creator-accept';
export const reset_event_string = 'elements-project3-creator-reset';

/**
 * [Projects3ProjectCreator Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects3ProjectCreator extends FormWrapper(backbone4) {
	#name: HTMLInputElement;
	#desc: HTMLTextAreaElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this.#name = template.querySelector('#project_title') as HTMLInputElement;
		this.#desc = template.querySelector('#proj_desc') as HTMLTextAreaElement;

		//Fancy code goes here
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return [];
	}
	protected accept() {
		const detail: ProjectObj = {
			id: -1,
			name: this.#name.value,
			desc: this.#desc.value,
			tags: [],
		};
		const ev = CustomComposedEvent(accept_event_string, detail);
		this.dispatchEvent(ev);
		this.reset();
	}
	protected reset() {
		this.#name.value = '';
		this.#desc.value = '';
	}
}

export default Projects3ProjectCreator;

Elements.load(Projects3ProjectCreator, 'elements-projects3-project-creator');
