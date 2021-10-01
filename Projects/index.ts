import {Elements} from '../elements/elements_core.js';
import {removeChildren} from '../elements/elements_helper.js';
import {accept_event_string, reset_event_string} from '../elements/container/form/Common.js';

import type {Toaster} from '../elements/toaster/toaster.js';
import type {ContainerDialog} from '../elements/container/dialog/dialog.js';
import type {ContainerFormSimple} from '../elements/container/form/simple/simple.js';


Elements.get(
	'container-autohide',
	'container-dialog',
	'toaster',
	'container-form-simple',
);


const project_creator_dialog = document.querySelector('#create_dialog') as ContainerDialog;
const stage = document.querySelector('#stage') as HTMLDivElement;
const name_input = document.querySelector('#project_title') as HTMLInputElement;
const toaster = document.querySelector('#toaster') as Toaster;


const remote_location = '//127.0.0.1:5002';


export const main = () => {
	const new_project = document.querySelector('#createProject')!;
	new_project.addEventListener('click', () => {
		project_creator_dialog.toggle();
	});
	const simple_form = document.querySelector('#create') as ContainerFormSimple;
	simple_form.addEventListener(accept_event_string, name_accept);
	simple_form.addEventListener(reset_event_string, name_reset);
	load_remote();

};

type remote_data = Array<[number, string]>;
const load_remote = async () => {
	const remote_data: remote_data = await (await fetch(remote_location)).json();
	console.log(remote_data);
	removeChildren(stage);
	const to_insert: HTMLDivElement[] = [];
	for (const [id, name] of remote_data) {
		to_insert.push(createMetaDisplay(id, name));
	}
	requestAnimationFrame(() => {
		for (const meta of to_insert) {
			stage.append(meta);
		}
	})
};


const createMetaDisplay = (id: number, name: string) => {
	const div = document.createElement('div');
	const a = document.createElement('a');
	const p = document.createElement('p');
	p.className = 'meta';
	a.className = 'meta';
	div.className = 'meta';
	a.href = `./projects3.html?meta=${id}`;
	p.textContent = name;
	a.append(p);
	div.append(a);
	return div;
};


const name_accept = async () => {
	const name = name_input.value;
	if (name === '') {
		return;
	}
	const form = new FormData();
	form.append('name', name);
	let response;
	try {
		response = await fetch(remote_location, {
			method: 'PUT',
			body: form,
		});
	} catch (e) {
		toaster.addToast({
			title: 'Error connecting to server',
			body: 'Check that the server is running',
		});
		throw e;
	}
	name_reset();
	const id = await response.json();
	const link = createMetaDisplay(id, name);
	requestAnimationFrame(() => {
		stage.append(link);
	});
};


const name_reset = () => {
	name_input.value = ''
}
