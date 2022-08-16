import {Elements} from '../elements/elements_core.js';
import type {ProjectObj} from '../elements/projects3/Common/Common.js';
import {Project} from '../elements/projects3/Common/Common.js';
import type {ContainerStacked} from '../elements/container/stacked/stacked.js';
import type {Toaster} from '../elements/toaster/toaster.js';
import {remote as ROOT_LOCATION} from './projects3base.js'
import type {Projects3Tagbar} from '../elements/projects3/tagbar/tagbar.js';
import {removeChildren} from '../elements/elements_helper.js';

type ProjectData = {
	project: ProjectObj,
	owner: number,
	owner_name: string,
	tags: Record<string, string>,
};


const load_promise = Elements.get('toaster');

Elements.get('container-stacked', 'projects3-tagbar');


const project_link = document.querySelector('a.project_link') as HTMLAnchorElement;
const meta_title = project_link.querySelector('p.header') as HTMLParagraphElement;
const title = document.querySelector('p.group_title') as HTMLParagraphElement;
const group_desc = document.querySelector('textarea.group_desc') as HTMLTextAreaElement;
const title_editor = document.querySelector('#group_name_edit') as HTMLInputElement;
const button_stack = document.querySelector('div.bottom_buttons > elements-container-stacked') as ContainerStacked;
const title_stack = document.querySelectorAll('.title_stack_holder > .title') as NodeListOf<HTMLDivElement>;
const toaster = document.querySelector('#toaster') as Toaster;
const tagbar = document.querySelector('elements-projects3-tagbar') as Projects3Tagbar;
const tags_desc = document.querySelector('.tags_desc') as HTMLDivElement;
const current_tags = document.querySelector('.current_tags') as HTMLDivElement;
const removed_tags_display = document.querySelector('.removed_tags') as HTMLDivElement;



export let system: Project;
let system_tags: Record<string, string | null> = {};
let added_tags: Set<string> = new Set();
let removed_tags: Set<string> = new Set();
let modified_tags: Set<string> = new Set();
let existing_tags: Set<string> = new Set();
let owner: number = -1;


class PageState {
	#tags = false;
	#edit = false;
	update_page_state () {
		if (this.#edit) {
			requestAnimationFrame(() => {
				title_stack[0].style.display = 'none';
			});
			if (this.#tags) {
				requestAnimationFrame(() => {
					title_stack[1].style.display = 'none';
					title_stack[2].style.display = 'grid';
					tags_desc.style.display = 'grid';
					group_desc.style.display = 'none';
					tagbar.focus();
				});
			} else {
				requestAnimationFrame(() => {
					title_stack[1].style.display = 'grid';
					title_stack[2].style.display = 'none';
					tags_desc.style.display = 'none';
					group_desc.style.display = 'initial';
					title_editor.focus();
				});
			}
		} else {
			requestAnimationFrame(() => {
				title_stack[1].style.display = 'none';
			});
			if (this.#tags) {
				requestAnimationFrame(() => {
					title_stack[0].style.display = 'none';
					title_stack[2].style.display = 'grid';
					tags_desc.style.display = 'grid';
					group_desc.style.display = 'none';
				});
			} else {
				requestAnimationFrame(() => {
					title_stack[0].style.display = 'grid';
					title_stack[2].style.display = 'none';
					tags_desc.style.display = 'none';
					group_desc.style.display = 'initial';
				});
			}
		}
		for (const button of current_tags.children) {
			(button as HTMLButtonElement).disabled = !this.edit;
		}
		for (const button of removed_tags_display.children) {
			(button as HTMLButtonElement).disabled = !this.edit;
		}
		button_stack.current = !this.#edit ? 's1' : 's2';
		title_editor.disabled = !this.#edit;
		group_desc.disabled = !this.#edit;
		tagbar.disabled = !this.#edit;
	}
	get tags() {
		return this.#tags;
	}
	set tags(value) {
		this.#tags = value;
		this.update_page_state();
	}
	get edit() {
		return this.#edit;
	}
	set edit(value) {
		this.#edit = value;
		this.update_page_state();
	}
	set(value: {tags: boolean, edit: boolean}) {
		this.#tags = value.tags;
		this.#edit = value.edit;
		this.update_page_state();
	}
}

let PAGE_STATE = new PageState();

const getRemoteLocation = () => {
	const params = new URL(document.location.href).searchParams;
	return `${ROOT_LOCATION}/projects/${params.get('project')}`;
}

const remote_location = getRemoteLocation();

await load_promise;


export const main = () => {
	const edit_button = document.querySelector('#group_edit_enable') as HTMLButtonElement;
	edit_button.addEventListener('click', () => {
		PAGE_STATE.edit = true;
	});
	const cancel_button = document.querySelector('#group_edit_cancel') as HTMLButtonElement;
	cancel_button.addEventListener('click', () => {
		reset();
	});
	const accept_button = document.querySelector('#group_edit_accept') as HTMLButtonElement;
	accept_button.addEventListener('click', () => {
		modifyNetworkProject(collect());
	});

	{
		const description_button = document.querySelector('#description_change') as HTMLButtonElement;
		const tags_button = document.querySelector('#tags_change') as HTMLButtonElement;
		description_button.addEventListener('click', () => {
			PAGE_STATE.tags = false;
		});
		tags_button.addEventListener('click', () => {
			PAGE_STATE.tags = true;
		});

	}
	tagbar.addEventListener('accept', (e) => {
		addTag((e as CustomEvent<string>).detail);
	});


	(async () => {
		load_remote();
	})();
};


const load_remote = async () => {
	const remote_data: ProjectData = await (await fetch(remote_location)).json();
	console.log(remote_data);
	system = Project.fromJSONObj(remote_data.project);
	owner = remote_data.owner;
	load(system, remote_data.owner, remote_data.owner_name, remote_data.tags);
	return system;
};

const load = (system: Project, owner: number, owner_name: string, tags: Record<string, string>) => {
	document.title = system.name;
	tagbar.remote = `${ROOT_LOCATION}/${owner}/tags`;
	{
		const folders = window.location.pathname.split('/');
		folders.pop();
		project_link.href = `${window.location.origin}${folders.join('/')}/projects3.html?meta=${owner}`
		requestAnimationFrame(() => {
			meta_title.textContent = owner_name;
		});
	}
	system_tags = tags;
	reset();
};

const reset = () => {
	PAGE_STATE.edit = false;
	title.textContent = system.name;
	title_editor.value = system.name;
	group_desc.value = system.desc;
	removeChildren(current_tags);
	removeChildren(removed_tags_display);
	for (const tag of system.tags) {
		const tag_button = createTagDisplay(tag, system_tags[tag]);
		requestAnimationFrame(() => {
			current_tags.append(tag_button);
		});
	}
	added_tags.clear();
	removed_tags.clear();
	modified_tags.clear();
	for (const tag of system.tags) {
		modified_tags.add(tag);
	}
	existing_tags = new Set(system.tags);
};

const createTagDisplay = (tag: string, color: string | null = '') => {
	const result = document.createElement('button');
	result.className = 'tag';
	const name = document.createElement('span');
	name.className = 'tag_name';
	name.textContent = tag;
	if (color !== null && color !== '') {
		result.style.backgroundColor = color;
	} else {
		name.style.textShadow = 'initial';
	}
	result.append(name);
	const listener = () => {
		console.log('hi')
		removeTag(tag, result, listener);
	};
	result.addEventListener('click', listener);
	result.disabled = !PAGE_STATE.edit;
	return result;
}


const modifyNetworkProject = async (data: collectT) => {
	const form = new FormData();
	if (data.name !== null) {
		form.append('name', data.name);
	}
	if (data.desc !== null) {
		form.append('desc', data.desc);
	}
	if (data.added_tags !== []) {
		form.append('added_tags', JSON.stringify(data.added_tags));
	}
	if (data.removed_tags !== []) {
		form.append('removed_tags', JSON.stringify(data.removed_tags));
	}
	let response;
	try {
		response = await fetch(remote_location, {
			method: 'POST',
			body: form,
		});
	} catch (e) {
		toaster.addToast({
			title: 'Error connecting to server',
			body: 'Check that the server is running',
		});
		throw e;
	}
	const return_value: {code: boolean, tags: {[key: string]: string}} = await response.json();
	console.log(return_value);
	if (return_value.code !== true) {return;}
	if (data.name !== null) {
		system.name = data.name;
	}
	if (data.desc !== null) {
		system.desc = data.desc;
	}
	system.tags = data.modified_tags;
	for (const tag in return_value.tags) {
		system_tags[tag] = return_value.tags[tag];
	}
	// console.log('a')
	reset();
}

const addTag = async (tag: string) => {
	if (modified_tags.has(tag)) {
		throw new Error('Tag to add is already present');
	}
	modified_tags.add(tag);
	removed_tags.delete(tag);
	added_tags.add(tag);
	if (system_tags[tag] === undefined) {
		await queryTag(tag);
	}
	console.log(tag, system_tags[tag], system_tags);
	const tag_button = createTagDisplay(tag, system_tags[tag]);
	requestAnimationFrame(() => {
		current_tags.append(tag_button);
	});
};

const removeTag = (tag: string, button: HTMLButtonElement, listener: () => void) => {
	if (!modified_tags.has(tag)) {
		throw new Error('Tag to remove is not present');
	}
	button.removeEventListener('click', listener);
	modified_tags.delete(tag);
	if (added_tags.has(tag)) {
		added_tags.delete(tag);
		button.remove();
	} else {
		removed_tags.add(tag);
		const new_listener = () => {
			undoRemoveTag(tag, button, new_listener);
		};
		button.addEventListener('click', new_listener);
		requestAnimationFrame(() => {
			removed_tags_display.append(button);
		});
	}
};

const undoRemoveTag = (tag: string, button: HTMLButtonElement, listener: () => void) => {
	if (!removed_tags.has(tag)) {
		throw new Error('Tag to restore has not being removed');
	}
	modified_tags.add(tag);
	removed_tags.add(tag);
	if (!existing_tags.has(tag)) {
		added_tags.add(tag);
	}
	button.removeEventListener('click', listener);
	const new_listener = () => {
		removeTag(tag, button, new_listener);
	};
	button.addEventListener('click', new_listener);
	requestAnimationFrame(() => {
		current_tags.append(button);
	});
};


type collectT = {
	name: string | null;
	desc: string | null;
	added_tags: Array<string> | null;
	removed_tags: Array<string> | null;
	modified_tags: Array<string>;
}

const collect = () => {
	// const result = {
	// 	name: title_editor.value,
	// 	desc: group_desc.value,
	//
	// }
	const result: collectT = {
		name: null,
		desc: null,
		added_tags: [],
		removed_tags: [],
		modified_tags: [...modified_tags],
	};
	if (title_editor.value !== system.name) {
		result.name = title_editor.value;
	}
	if (group_desc.value !== system.desc) {
		result.desc = group_desc.value;
	}
	for (const entry of existing_tags) {
		if (!modified_tags.has(entry)) {
			result.removed_tags!.push(entry);
		}
	}
	for (const entry of modified_tags) {
		if (!existing_tags.has(entry)) {
			result.added_tags!.push(entry);
		}
	}
	return result;
}

const queryTag = async (tag: string): Promise<null|string> => {
	const form = new FormData();
	form.append('tag', tag);
	let response;
	try {
		response = await fetch(`${ROOT_LOCATION}/${owner}/tags`, {
			method: 'POST',
			body: form,
		});
	} catch (e) {
		toaster.addToast({
			title: 'Error connecting to server',
			body: 'Check that the server is running',
		});
		return null;
	}
	const color: null | string = await response.json();
	system_tags[tag] = color;
	return color;
}
