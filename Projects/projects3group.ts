import {Elements} from '../elements/elements_core.js';
import type {ProjectGroupNetwork, ProjectObj} from '../elements/projects3/Common/Common.js';
import {ProjectGroup, Project} from '../elements/projects3/Common/Common.js';
import type {ContainerStacked} from '../elements/container/stacked/stacked.js';
import type {Toaster} from '../elements/toaster/toaster.js';


type GroupData = {
	group: ProjectGroupNetwork,
	projects: ProjectObj[],
	owner: number,
};

const load_promise = Elements.get('toaster');

Elements.get('container-stacked');


const ROOT_LOCATION = '//127.0.0.1:5002'

const project_link = document.querySelector('a.project_link') as HTMLAnchorElement;
const title = document.querySelector('p.group_title') as HTMLParagraphElement;
const desc = document.querySelector('textarea.group_desc') as HTMLTextAreaElement;
const title_editor = document.querySelector('#group_name_edit') as HTMLInputElement;
const button_stack = document.querySelector('div.bottom_buttons > elements-container-stacked') as ContainerStacked;
const title_stack = document.querySelectorAll('.title_stack_holder > .stacked.centre') as NodeListOf<HTMLDivElement>;
const toaster = document.querySelector('#toaster') as Toaster;


export let system: ProjectGroup;

const getRemoteLocation = () => {
	const params = new URL(document.location.href).searchParams;
	return `${ROOT_LOCATION}/groups/${params.get('group')}`;
}

const remote_location = getRemoteLocation();

await load_promise;


export const main = () => {
	const edit_button = document.querySelector('#group_edit_enable') as HTMLButtonElement;
	edit_button.addEventListener('click', () => {
		toggle_edit(true);
	});
	const cancel_button = document.querySelector('#group_edit_cancel') as HTMLButtonElement;
	cancel_button.addEventListener('click', () => {
		reset();
	});
	const accept_button = document.querySelector('#group_edit_accept') as HTMLButtonElement;
	accept_button.addEventListener('click', () => {
		modifyNetworkGroup(title_editor.value, desc.value);
	});

	(async () => {
		load_remote();
	})();
};


const load_remote = async () => {
	const remote_data: GroupData = await (await fetch(remote_location)).json();
	console.log(remote_data);
	system = ProjectGroup.fromNetworkObj(remote_data.group);
	load(system, remote_data.owner);
	return system;
};

const load = (system: ProjectGroup, owner: number) => {
	document.title = system.name;
	{
		const folders = window.location.pathname.split('/');
		folders.pop();
		project_link.href = `${window.location.origin}${folders.join('/')}/projects3.html?meta=${owner}`
	}
	reset();
};


const reset = () => {
	toggle_edit(false);
	title.textContent = system.name;
	title_editor.value = system.name;
	desc.value = system.desc;
};


const toggle_edit = (editmode: boolean) => {
	if (editmode) {
		requestAnimationFrame(() => {
			title_stack[0].style.display = 'none';
			title_stack[1].style.display = 'grid';
			title_editor.focus();
		});
	} else {
		requestAnimationFrame(() => {
			title_stack[0].style.display = 'grid';
			title_stack[1].style.display = 'none';
		});
	}
	button_stack.current = !editmode ? 's1' : 's2';
	title_editor.disabled = !editmode;
	desc.disabled = !editmode;
}

const modifyNetworkGroup = async (title: string, desc: string) => {
	const form = new FormData();
	if (title !== system.name) {
		form.append('name', title);
	}
	if (title !== system.desc) {
		form.append('desc', desc);
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
	const return_code = await response.json();
	if (return_code !== true) {return;}
	system.name = title;
	system.desc = desc;
	reset();
}
