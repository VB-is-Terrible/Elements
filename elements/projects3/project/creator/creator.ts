const recommends: Array<string> = ['container-form-simple'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {CustomComposedEvent, removeChildren, setToArray} from '../../../elements_helper.js';
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
	edit: boolean;
	constructor(
		id: id,
		name: string,
		desc: string,
		tags: string[],
		edit: boolean,
	) {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.tags = tags;
		this.edit = edit;
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
	#tags_store: Set<string> = new Set();
	#edit_mode = false;
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
			setToArray(this.#tags_store),
			this.#edit_mode,
		);
		const ev = CustomComposedEvent(AcceptDetail.event_string, detail);
		this.dispatchEvent(ev);
		this.reset();
	}
	protected reset() {
		this.#name.value = '';
		this.#desc.value = '';
		this.#project_id = -1;
		this.#edit_mode = false;
		requestAnimationFrame(() => {
			this.#warn.style.display = 'none';
		});
		this.#tags_store = new Set();
		// this.setTags(['this', 'is', 'a', 'test', 'nothing but a really', 'long test phrase', 'to test when the tags', 'should overflow', 'and it turns out that', 'this list of strings is not', 'big enough']);
		this.setTags([]);


	}
	private setTags(tags: Iterable<string>) {
		removeChildren(this.#tags);
		this.#tags_store = new Set();
		const tag_buttons: HTMLElement[] = [];
		for (const tag of tags) {
			this.#tags_store.add(tag);
			tag_buttons.push(this.#createTag(tag));
		}
		requestAnimationFrame(() => {
			for (const tag of tag_buttons) {
				this.#tags.append(tag);
			}
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
		});
		return result;
	}
	#removeTag(tag: string, button: HTMLButtonElement) {
		button.remove();
		this.#tags_store.delete(tag);
	}
	setEdit(project: ProjectObj) {
		this.#project_id = project.id;
		this.#name.value = project.name
		this.#desc.value = project.desc;
		this.setTags(project.tags);
		this.#edit_mode = true;
	}
	#tagInsert() {
		const new_tag = this.#tag_input.value;
		if (this.#tags_store.has(new_tag)) {
			throw new Error(`Duplicate tag ${new_tag}`);
		}
		this.#tags_store.add(new_tag);
		this.#tag_input.value = '';
		const button = this.#createTag(new_tag);
		this.#tags.append(button);
	}
}

export default Projects3ProjectCreator;

Elements.load(Projects3ProjectCreator, 'elements-projects3-project-creator');
