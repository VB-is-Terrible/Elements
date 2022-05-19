import {Elements} from '../elements/elements_core.js';
import {randint, removeChildren} from '../elements/elements_helper.js';
import {AcceptDetail} from '../elements/projects3/project/creator/creator.js';
import {AcceptDetail as GroupDetail} from '../elements/projects3/projectgroup/creator/creator.js';
import type {Projects3ProjectCreator} from '../elements/projects3/project/creator/creator.js';
import type {ProjectObj, SystemNetworkObj, id, ProjectGroupNetwork} from '../elements/projects3/Common/Common.js';
import {System, Project, Projects3Drop, ProjectGroup} from '../elements/projects3/Common/Common.js';
import {Projects3ProjectDisplay} from '../elements/projects3/project/display/display.js';
import type {ContainerDialog} from '../elements/container/dialog/dialog.js';
import type {Projects3ProjectgroupDisplay} from '../elements/projects3/projectgroup/display/display.js';
import {read_details} from '../elements/draggable/types.js';
import type {Grid} from '../elements/grid/grid.js'
import type {Toaster} from '../elements/toaster/toaster.js';
import {get_setting} from '../elements/elements_options.js';


const load_promise = Elements.get(
	'projects3-project-creator',
	'projects3-projectgroup-creator',
	'projects3-projectgroup-display',
	'grid',
	'toaster',
	'container-dialog',
);

Elements.get(
	'container-autohide',
	'container-sidebar',
	'projects3-project-display',
	'animation-sidepanel',
);

const project_creator = document.querySelector('elements-projects3-project-creator') as Projects3ProjectCreator;
const project_creator_dialog = document.querySelector('#create_dialog') as ContainerDialog;
const group_creator = document.querySelector('elements-projects3-projectgroup-creator') as Projects3ProjectCreator;
const group_creator_dialog = document.querySelector('#group_dialog') as ContainerDialog;
const unsorted = document.querySelector('#unsorted') as Projects3ProjectgroupDisplay;
const group_grid = document.querySelector('#groups') as Grid;
const toaster = document.querySelector('#toaster') as Toaster;


export let system: System;
const grid_display = new Map<id, Projects3ProjectgroupDisplay>();
const project_displays = new Map<id, Projects3ProjectDisplay>();


const getRemoteLocation = () => {
	const params = new URL(document.location.href).searchParams;
	return `//127.0.0.1:5002/${params.get('meta')}`;
}
const remote_location = getRemoteLocation();


await load_promise;
export const main = () => {
	project_creator.addEventListener(AcceptDetail.event_string, (e: Event) => {
		const detail = read_details(e as CustomEvent, AcceptDetail);
		detail.id = -1;
		createNetworkProject(detail);
	});
	group_creator.addEventListener(GroupDetail.event_string, (e) => {
		const detail = read_details(e as CustomEvent, GroupDetail);
		console.log(detail);
		createNetworkGroupProject(detail);
	})
	const new_project = document.querySelector('#createProject')!;
	new_project.addEventListener('click', () => {
		project_creator_dialog.toggle();
	});
	const new_group = document.querySelector('#createGroup') as HTMLButtonElement;
	new_group.addEventListener('click', () => {
		group_creator_dialog.toggle();
	});
	document.body.style.setProperty('--animation_duration_long', get_setting<number>('long_duration').toString());
	unsorted.addEventListener(Projects3Drop.event_string, (e) => {project_move(e as CustomEvent)});
	(async () => {
		system = await load_remote();
	})();
};


const load_remote = async () => {
	const remote_data: SystemNetworkObj = await (await fetch(remote_location)).json();
	const system = System.fromNetworkObj(remote_data, remote_location);
	load(system);
	return system;
};


const load = (system: System) => {
	document.title = system.name;

	removeChildren(unsorted);

	const seen = new Set<id>();
	group_grid.columns = system.project_groups.size;
	let i = 1;
	for (const iter of system.project_groups) {
		const [id, group] = iter;
		const display = createGroupDisplay(group);
		display.slot = `s${i}`;
		i++;
		for (const project_id of group.projects) {
			const project_display = Projects3ProjectDisplay.fromProject(
				system.get_project_by_id(project_id)!
			);
			seen.add(project_id);
			display.append(project_display);
			project_displays.set(project_id, project_display);
		}
		requestAnimationFrame(() => {
			group_grid.append(display);
		});
		grid_display.set(id, display);
	}
	for (const id of system.projects.keys()) {
		if (!seen.has(id)) {
			const project_display = Projects3ProjectDisplay.fromProject(
				system.get_project_by_id(id)!
			);
			project_displays.set(id, project_display);
			requestAnimationFrame(() => {
				unsorted.append(project_display);
			});
		}
	}
}

const project_move = async (e: CustomEvent) => {
	const details = read_details(e, Projects3Drop);
	console.log(details);
	const form = new FormData();
	form.append('operation', 'move');
	form.append('src', details.src_group.toString());
	form.append('dst', details.dst_group.toString());
	form.append('id', details.project_id.toString());
	let response;
	try {
		response = await fetch(remote_location + '/projects', {
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
	console.log(return_code);
	if (return_code !== true) {
		return;
	}

	if (details.src_group !== -1) {
		const src_group = system.get_project_group_by_id(details.src_group)!;
		src_group.projects.filter(item => item !== details.project_id);
	}
	const dst = grid_display.get(details.dst_group)!;
	const dst_group = system.get_project_group_by_id(details.dst_group)!;
	dst_group.projects.push(details.project_id);
	const project = project_displays.get(details.project_id)!;
	dst.append(project);
}


const createGroupDisplay = (group: ProjectGroup) => {
	const result = document.createElement('elements-projects3-projectgroup-display') as Projects3ProjectgroupDisplay;
	result.context = 'projects3/project';
	result.drop_effect = 'move';
	result.effect_allowed = 'all';
	result.addEventListener(Projects3Drop.event_string, (e) => {project_move(e as CustomEvent)});
	result.project_id = group.id;
	const title = document.createElement('p');
	title.className = 'group_title';
	title.textContent = group.name;
	result.append(title);
	const desc = document.createElement('p');
	desc.className = 'group_desc';
	desc.textContent = group.desc;
	result.append(desc);
	return result;
}


const createNetworkProject = async (project_obj: ProjectObj) => {
	console.log(project_obj);
	const form = new FormData();
	form.append('name', project_obj.name);
	form.append('desc', project_obj.desc);
	form.append('tags', JSON.stringify(project_obj.tags));
	let response;
	try {
		response = await fetch(remote_location + '/projects', {
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
	const new_project_obj = await response.json();
	if (new_project_obj === {}) {
		console.log('Got empty response');
		return;
	}
	const project = Project.fromJSONObj(new_project_obj);
	system.projects.set(project.id, project);
	const display = Projects3ProjectDisplay.fromProject(project);
	project_displays.set(project.id, display)
	requestAnimationFrame(() => {
		unsorted.append(display);
	});
}


const createNetworkGroupProject = async (group_obj: GroupDetail) => {
	const form = new FormData();
	form.append('name', group_obj.name);
	if (group_obj.desc !== undefined) {
		form.append('desc', group_obj.desc);
	}
	form.append('projects', JSON.stringify(group_obj.projects));
	let response;
	try {
		response = await fetch(remote_location + '/groups', {
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
	const new_group_project_obj = await response.json();
	if (new_group_project_obj === {}) {
		console.log('Got empty response');
		return;
	}
	const project_group = ProjectGroup.fromJSONObj(new_group_project_obj);
	system.project_groups.set(project_group.id, project_group);
	const display = createGroupDisplay(project_group);
	requestAnimationFrame(() => {
		group_grid.append(display);
		group_grid.columns++;
	});
};
