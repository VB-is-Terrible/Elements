const recommends: Array<string> = ['projects2-Project'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {applyPriorProperties} from '../../../elements_helper.js';
import {Project, UpdateWrapper} from '../../Project/Project.js'

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects2ProjectDisplay';
/**
 * [Projects2ProjectDisplay Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects2ProjectDisplay extends backbone4 {
	_updater: UpdateWrapper<Project> | null = null;
        private _refresh_callback: (changed: Project) => void;
        private _name: HTMLParagraphElement;
        private _status: HTMLParagraphElement;
        private _progress: HTMLParagraphElement;
        private _status_display: HTMLDivElement;
        private _desc: HTMLParagraphElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._name = template.querySelector('p.name') as HTMLParagraphElement;
		this._status = template.querySelector('p.status') as HTMLParagraphElement;
		this._progress = template.querySelector('p.progress') as HTMLParagraphElement;
		this._status_display = template.querySelector('#status') as HTMLDivElement;
		this._desc = template.querySelector('p.desc') as HTMLParagraphElement;
		//Fancy code goes here
		shadow.appendChild(template);
		this._refresh_callback = (_data) => {this._refresh();};
		applyPriorProperties(this, 'updater');
	}
	private _refresh() {
		if (this.updater === null) {
			return;
		}
		const value = this.updater.data;
		requestAnimationFrame(() => {
			this._name.textContent = value.name;
			this._desc.textContent = value.desc;
		});
	}
	get updater() {
		return this._updater;
	}
	set updater(value: UpdateWrapper<Project> | null) {
		if (this._updater !== null) {
			this._updater.removeListener(this._refresh_callback);
		}
		this._updater = value;
		if (value !== null) {
			value.addListener(this._refresh_callback);
		}
		this._refresh();
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		console.log('disconnecting');
	}
	static get observedAttributes() {
		return [];
	}

}

export default Projects2ProjectDisplay;

Elements.elements.Projects2ProjectDisplay = Projects2ProjectDisplay;

Elements.load(Projects2ProjectDisplay, 'elements-projects2-project-display');
