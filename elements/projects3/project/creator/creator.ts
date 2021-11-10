const recommends: Array<string> = ['container-form-simple'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {CustomComposedEvent, removeChildren} from '../../../elements_helper.js';
import {FormWrapper} from '../../../container/form/Common.js';
import type {ProjectObj, id} from '../../Common/Common.js';


Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects3ProjectCreator';


export class AcceptDetail implements ProjectObj {
	static readonly event_string = 'elements-project3-creator-accept';
	id: id;
	name: string;
	desc: string;
	tags: string[];
	constructor(
		id: id,
		name: string,
		desc: string,
		tags: string[],
	) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.tags = tags;
	}
}

/**
 * [Projects3ProjectCreator Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects3ProjectCreator extends FormWrapper(backbone4) {
	#project_id = -1;
	#name: HTMLInputElement;
	#desc: HTMLTextAreaElement;
	#warn: HTMLImageElement;
	#tags: HTMLDivElement;
	#tag_input: HTMLInputElement;
	#tags_store: string[] = [];
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this.#name = template.querySelector('#project_title') as HTMLInputElement;
		this.#desc = template.querySelector('#proj_desc') as HTMLTextAreaElement;
		this.#warn = template.querySelector('img.warn') as HTMLImageElement;
		this.#tags = template.querySelector('div.tag_holder') as HTMLDivElement;
		this.#tag_input = template.querySelector('#tag_input') as HTMLInputElement;
		this.#tag_input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				this.#tagInsert();
			}
		});
		const tag_confirm = template.querySelector('div.tag_input button') as HTMLButtonElement;
		tag_confirm.addEventListener('click', () => {
			this.#tagInsert();
		})
		this.#name.addEventListener('blur', () => {
			if (this.#name.value === '') {
				requestAnimationFrame(() => {
					this.#warn.style.display = 'block';
				});
			}
		});

		//Fancy code goes here
		shadow.appendChild(template);
		// this.reset();
	}
	static get observedAttributes() {
		return [];
	}
	protected accept() {
		if (this.#name.value === '') {
			return;
		}
		const detail = new AcceptDetail(
			this.#project_id,
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
		this.#tags_store = [];
		this.setTags(['this', 'is', 'a', 'test', 'nothing but a really', 'long test phrase', 'to test when the tags', 'should overflow', 'and it turns out that', 'this list of strings is not', 'big enough']);

	}
	private setTags(tags: string[]) {
		removeChildren(this.#tags);
		this.#tags_store = tags;
		const tag_buttons: HTMLElement[] = [];
		for (const tag of tags) {
			tag_buttons.push(this.#createTag(tag));
		}
		requestAnimationFrame(() => {
			for (const tag of tag_buttons) {
				this.#tags.append(tag);
			}
			// this.#tags.textContent = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
		});
	}
	#createTag(tag: string) {
		const result = document.createElement('button');
		result.className = 'tag_remove';
		const name = document.createElement('span');
		name.className = 'tag_name';
		name.textContent = tag;
		result.append(name);
		result.addEventListener('click', () => {
			this.#removeTag(tag, result);
		})
		return result;
	}
	#removeTag(tag: string, button: HTMLButtonElement) {
		button.remove();
		const index = this.#tags_store.indexOf(tag);
		this.#tags_store.splice(index);
	}
	setEdit(project: ProjectObj) {
		this.#project_id = project.id;
		this.#name.value = project.name
		this.#desc.value = project.desc;
		this.setTags(project.tags);
	}
	#tagInsert() {
		const new_tag = this.#tag_input.value;
		this.#tags_store.push(new_tag);
		const button = this.#createTag(new_tag);
		this.#tags.append(button);
	}
}

export default Projects3ProjectCreator;

Elements.load(Projects3ProjectCreator, 'elements-projects3-project-creator');
