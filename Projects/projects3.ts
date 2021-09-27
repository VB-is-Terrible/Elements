import {Elements} from '../elements/elements_core.js';
import {randint, removeChildren} from '../elements/elements_helper.js';
import {accept_event_string as project_creator_accept} from '../elements/projects3/project/creator/creator.js';
import type {Projects3ProjectCreator} from '../elements/projects3/project/creator/creator.js';
import type {ProjectObj, SystemNetworkObj, id, ProjectGroupNetwork, ProjectGroup} from '../elements/projects3/Common/Common.js';
import {System, Project, Projects3Drop,} from '../elements/projects3/Common/Common.js';
import {Projects3ProjectDisplay} from '../elements/projects3/project/display/display.js';
import type {ContainerDialog} from '../elements/container/dialog/dialog.js';
import type {Projects3ProjectgroupDisplay} from '../elements/projects3/projectgroup/display/display.js';
import {read_details} from '../elements/draggable/types.js';
import type {Grid} from '../elements/grid/grid.js'


const load_promise = Elements.get(
	'container-autohide',
	'container-dialog',
	'projects3-project-creator',
	'projects3-projectgroup-display',
	'projects3-project-display',
	'container-sidebar',
	'grid',
)


const project_creator = document.querySelector('elements-projects3-project-creator') as Projects3ProjectCreator;
const project_creator_dialog = document.querySelector('#create_dialog') as ContainerDialog;
const unsorted = document.querySelector('#unsorted') as Projects3ProjectgroupDisplay;
const group_grid = document.querySelector('#groups') as Grid;


const new_id = () => randint(0, Math.pow(2, 24));


const load_location = 'projects3'
const load_string = localStorage.getItem(load_location) ?? '{"projects": {}, "project_groups": {}}';
console.log(load_string);
const load_obj = JSON.parse(load_string) as SystemNetworkObj;


export let system: System;
const grid_display = new Map<id, Projects3ProjectgroupDisplay>();


await load_promise;
export const main = () => {
	project_creator.addEventListener(project_creator_accept, (e: Event) => {
		const detail = (e as CustomEvent<ProjectObj>).detail;
		detail.id = -1;
		const project_obj = Project.fromJSONObj(detail)
		console.log(project_obj);
	});
	const new_project = document.querySelector('#createProject')!;
	new_project.addEventListener('click', () => {
		project_creator_dialog.toggle();
	});
	unsorted.addEventListener(Projects3Drop.event_string, (e) => {on_drop(e as CustomEvent)});
	(async () => {
		system = await load_remote();
	})();
};


const load_remote = async () => {
	const remote = '//127.0.0.1:5002/2';
	const remote_data: SystemNetworkObj = await (await fetch(remote)).json();
	const system = System.fromNetworkObj(remote_data, remote);
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
			requestAnimationFrame(() => {
				unsorted.append(project_display);
			});
		}
	}
}

const on_drop = (e: CustomEvent) => {
	const details = read_details(e, Projects3Drop);
	console.log(details);
}


const createGroupDisplay = (group: ProjectGroup) => {
	const result = document.createElement('elements-projects3-projectgroup-display') as Projects3ProjectgroupDisplay;
	result.context = 'projects3/project';
	result.addEventListener(Projects3Drop.event_string, (e) => {on_drop(e as CustomEvent)});
	result.project_id = group.id;
	return result;
}
