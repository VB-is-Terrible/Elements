const recommends: Array<string> = ['container-form-simple'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {CustomComposedEvent} from '../../../elements_helper.js';
import {FormWrapper} from '../../../container/form/Common.js';
import type {id, ProjectGroupObj} from '../../Common/Common.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects3ProjectgroupCreator';

export class AcceptDetail implements ProjectGroupObj {
	static readonly event_string = 'elements-project3-projectgroup-creator-accept';
	id: id;
	name: string;
	desc: string;
	projects: Array<id>;
	constructor(
		id: id,
		name: string,
		desc: string,
		projects: Array<id>,
	) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.projects = projects;
	}
}


/**
 * [Projects3ProjectgroupCreator Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects3ProjectgroupCreator extends FormWrapper(backbone4) {
	#name: HTMLInputElement;
	#desc: HTMLTextAreaElement;
	#warn: HTMLImageElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this.#name = template.querySelector('#project_title') as HTMLInputElement;
		this.#desc = template.querySelector('#proj_desc') as HTMLTextAreaElement;
		this.#warn = template.querySelector('img.warn') as HTMLImageElement;
		this.#name.addEventListener('blur', () => {
			if (this.#name.value === '') {
				requestAnimationFrame(() => {
					this.#warn.style.display = 'block';
				});
			}
		});

		//Fancy code goes here
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return [];
	}
	protected accept() {
		if (this.#name.value === '') {
			return;
		}
		const detail = new AcceptDetail(
			-1,
			this.#name.value,
			this.#desc.value,
			[],
		);
		const ev = CustomComposedEvent(AcceptDetail.event_string, detail);
		this.dispatchEvent(ev);
		this.reset();
	}
	protected reset() {
		this.#name.value = '';
		this.#desc.value = '';
		requestAnimationFrame(() => {
			this.#warn.style.display = 'none';
		});
	}
}

export default Projects3ProjectgroupCreator;

Elements.load(Projects3ProjectgroupCreator, 'elements-projects3-projectgroup-creator');
