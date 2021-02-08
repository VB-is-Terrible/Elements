export const recommends = [];
export const requires = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import { CustomComposedEvent } from '../../../elements_helper.js'
import {ProjectGroup} from '../../../projects2/Project/Project.js';


const ELEMENT_NAME = 'Projects2Project_groupCreator';
/**
 * [Projects2Project_groupCreator Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects2Project_groupCreator extends backbone4 {
        private _name: HTMLInputElement;
        private _desc: HTMLTextAreaElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._name = template.querySelector('#proj_name') as HTMLInputElement;
		this._desc = template.querySelector('#proj_desc') as HTMLTextAreaElement;
		const close = template.querySelector('button.title_close') as HTMLButtonElement;
		close.addEventListener('click', () => {
			this._close();
		});
		const cancel = template.querySelector('#cancel') as HTMLButtonElement;
		const accept = template.querySelector('#accept') as HTMLButtonElement;
		cancel.addEventListener('click', () => {
			this.reset();
			this._close();
		});
		accept.addEventListener('click', () => {
			this.accept();
			this._close();
		});
		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	static get observedAttributes() {
		return [];
	}
	reset() {
		requestAnimationFrame(() => {
			this._name.value = '';
			this._desc.value = '';
		});
	}
	accept() {
		const result = new ProjectGroup(-1, this._name.value, this._desc.value);
		const ev = new CustomEvent('project_create', {detail: result});
		this.dispatchEvent(ev);
		this.reset();
	}
	_close() {
		console.log('firing');
		const ev = CustomComposedEvent('dialog_close');
		this.dispatchEvent(ev);
	}
}

export default Projects2Project_groupCreator;

Elements.elements.Projects2Project_groupCreator = Projects2Project_groupCreator;

Elements.load(Projects2Project_groupCreator, 'elements-projects2-project_group-creator');
