export const recommends = [];
export const requires = ['projects2-project-display', 'projects2-Project'];

import {Elements} from '../../elements_core.js';
import * as Projects from '../Project/Project.js';
import type {UpdateWrapper} from '../Project/Project.js';
import { Projects2Project_groupDisplay } from '../project_group/display/display.js';
import type {ContainerDialog} from '../../container/dialog/dialog.js';



// export const testData = [[{'id': 0, 'name': 'etypically', 'desc': 'polymery'}, {'id': 1, 'name': 'carrollite', 'desc': 'soudge'}, {'id': 2, 'name': 'subseres', 'desc': 'frisolee'}, {'id': 3, 'name': 'aladfar', 'desc': 'consummated'}, {'id': 4, 'name': 'fleeted', 'desc': 'vespiform'}], [{'id': 5, 'name': 'goldsmith', 'desc': 'hideousness'}, {'id': 6, 'name': 'malayan', 'desc': 'commensally'}, {'id': 7, 'name': 'dextropedal', 'desc': 'reedling'}, {'id': 8, 'name': 'rufofuscous', 'desc': 'influx'}, {'id': 9, 'name': 'nonmultiplicative', 'desc': 'ulemas'}], [{'id': 10, 'name': 'heregild', 'desc': 'predeny'}, {'id': 11, 'name': 'corrosion', 'desc': 'bullocky'}, {'id': 12, 'name': 'acrobatics', 'desc': 'clemence'}, {'id': 13, 'name': 'conational', 'desc': 'obligationary'}, {'id': 14, 'name': 'ploughstaff', 'desc': 'caecostomy'}], [{'id': 15, 'name': 'encreel', 'desc': 'ruthlessly'}, {'id': 16, 'name': 'anfractuosity', 'desc': 'alethea'}, {'id': 17, 'name': 'chubsucker', 'desc': 'semialbinism'}, {'id': 18, 'name': 'dissuading', 'desc': 'toadpipes'}, {'id': 19, 'name': 'unobedient', 'desc': 'avanti'}], [{'id': 20, 'name': 'torpedoplane', 'desc': 'goalie'}, {'id': 21, 'name': 'chondromyoma', 'desc': 'analphabetical'}, {'id': 22, 'name': 'basibranchial', 'desc': 'reburnish'}, {'id': 23, 'name': 'besnare', 'desc': 'datos'}, {'id': 24, 'name': 'zavijava', 'desc': 'sarcinas'}]];

export const testData = {'project_groups': [{'id': 25, 'name': 'mayflowers', 'desc': 'torsiometer', 'projects': [{'id': 0, 'name': 'etypically', 'desc': 'polymery'}, {'id': 1, 'name': 'carrollite', 'desc': 'soudge'}, {'id': 2, 'name': 'subseres', 'desc': 'frisolee'}, {'id': 3, 'name': 'aladfar', 'desc': 'consummated'}, {'id': 4, 'name': 'fleeted', 'desc': 'vespiform'}]}, {'id': 26, 'name': 'scientificoromantic', 'desc': 'stradl', 'projects': [{'id': 5, 'name': 'goldsmith', 'desc': 'hideousness'}, {'id': 6, 'name': 'malayan', 'desc': 'commensally'}, {'id': 7, 'name': 'dextropedal', 'desc': 'reedling'}, {'id': 8, 'name': 'rufofuscous', 'desc': 'influx'}, {'id': 9, 'name': 'nonmultiplicative', 'desc': 'ulemas'}]}, {'id': 27, 'name': 'polythalamic', 'desc': 'overcanny', 'projects': [{'id': 10, 'name': 'heregild', 'desc': 'predeny'}, {'id': 11, 'name': 'corrosion', 'desc': 'bullocky'}, {'id': 12, 'name': 'acrobatics', 'desc': 'clemence'}, {'id': 13, 'name': 'conational', 'desc': 'obligationary'}, {'id': 14, 'name': 'ploughstaff', 'desc': 'caecostomy'}]}, {'id': 28, 'name': 'excitor', 'desc': 'duckwife', 'projects': [{'id': 15, 'name': 'encreel', 'desc': 'ruthlessly'}, {'id': 16, 'name': 'anfractuosity', 'desc': 'alethea'}, {'id': 17, 'name': 'chubsucker', 'desc': 'semialbinism'}, {'id': 18, 'name': 'dissuading', 'desc': 'toadpipes'}, {'id': 19, 'name': 'unobedient', 'desc': 'avanti'}]}, {'id': 29, 'name': 'engulfment', 'desc': 'hyetometric', 'projects': [{'id': 20, 'name': 'torpedoplane', 'desc': 'goalie'}, {'id': 21, 'name': 'chondromyoma', 'desc': 'analphabetical'}, {'id': 22, 'name': 'basibranchial', 'desc': 'reburnish'}, {'id': 23, 'name': 'besnare', 'desc': 'datos'}, {'id': 24, 'name': 'zavijava', 'desc': 'sarcinas'}]}]};

let projects: Projects.System;

const populate = (data: Projects.SystemObj) => {
	projects = Projects.System.fromJSONObj(data);
	const main = document.querySelector('#main') as HTMLDivElement;
	requestAnimationFrame(() => {
		main.innerHTML = '';
	});
	for (const group of projects.project_groups.values()) {
		const display = project_group_display(group);
		requestAnimationFrame(() => {
			main.append(display);
		});
	}
	console.log('test');
};

const project_group_display: (arg0: Projects.UpdateWrapper<Projects.ProjectGroup>) => HTMLDivElement = (pg: UpdateWrapper<Projects.ProjectGroup>) => {
	const div = document.createElement('div');
	const display = document.createElement('elements-projects2-project_group-display') as Projects2Project_groupDisplay;
	display.updater = pg;
	div.append(display);
	return div;
};

const read_projects = () => {
	return projects;
};

//@ts-ignore
window.read_projects = read_projects;


const newProjectButton = document.querySelector('#create') as HTMLButtonElement;
const createDialog = document.querySelector('#create_dialog') as ContainerDialog;

const setUpListeners = () => {
	newProjectButton.addEventListener('click', (e) => {
		createDialog.toggle();
	});
};

const main = () => {
	setUpListeners();
	populate(testData);

};

main();

Elements.loaded('projects2-project_main');
