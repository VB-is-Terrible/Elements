import {Elements} from '../elements/elements_core.js';
import {randint} from '../elements/elements_helper.js';
import {accept_event_string as project_creator_accept} from '../elements/projects3/project/creator/creator.js';
import type {Projects3ProjectCreator} from '../elements/projects3/project/creator/creator.js';
import type {ProjectObj, SystemNetworkObj, Projects3Drop} from '../elements/projects3/Common/Common.js';
import {System, Project} from '../elements/projects3/Common/Common.js';
import {Projects3ProjectDisplay} from '../elements/projects3/project/display/display.js';
import type {ContainerDialog} from '../elements/container/dialog/dialog.js';
import type {Projects3ProjectgroupDisplay} from '../elements/projects3/projectgroup/display/display.js';


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



const new_id = () => randint(0, Math.pow(2, 24));


const load_location = 'projects3'
const load_string = localStorage.getItem(load_location) ?? '{"projects": {}, "project_groups": {}}';
console.log(load_string);
const load_obj = JSON.parse(load_string) as SystemNetworkObj;


export const system = System.fromNetworkObj(load_obj);
const next_system = System.fromNetworkObj(load_obj);

console.log(system);

const save = () => {
	localStorage.setItem(load_location, JSON.stringify(next_system));
};


await load_promise;
export const main = () => {
	project_creator.addEventListener(project_creator_accept, (e: Event) => {
		const detail = (e as CustomEvent<ProjectObj>).detail;
		detail.id = new_id();
		next_system.projects.set(detail.id, Project.fromJSONObj(detail));
		save();
		console.log(next_system);
	});
	const new_project = document.querySelector('#createProject')!;
	new_project.addEventListener('click', () => {
		project_creator_dialog.toggle()
	});
	load(system);
};


const load = (system: System) => {
	for (const id of system.projects) {
		const display = Projects3ProjectDisplay.fromProject(id[1]);
		unsorted.append(display);
	}
}
