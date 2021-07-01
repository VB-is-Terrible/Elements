const recommends: Array<string> = ['projects2-Project', 'projects2-project-display'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import {applyPriorProperties} from '../../../elements_helper.js';
import { Project, ProjectGroup, UpdateWrapper } from '../../Project/Project.js';
import { Projects2ProjectDisplay } from '../../project/display/display.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects2Project_groupDisplay';
/**
 * [Projects2Project_groupDisplay Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects2Project_groupDisplay extends backbone4 {
	_updater: UpdateWrapper<ProjectGroup> | null = null;
	private _refresh_callback: (changed: ProjectGroup) => void;
	private _name: HTMLParagraphElement;
	private _desc: HTMLParagraphElement;
        private _shadow: ShadowRoot;
        private _project_list: HTMLDivElement;
	constructor() {
		super();

		this._shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._name = template.querySelector('p.name') as HTMLParagraphElement;
		this._desc = template.querySelector('p.desc') as HTMLParagraphElement;
		this._project_list = template.querySelector('#single_list') as HTMLDivElement;
		//Fancy code goes here
		this._shadow.appendChild(template);
		this._refresh_callback = (_data) => {this._refresh();};
		applyPriorProperties(this, 'updater');
	}
	private _refresh() {
		if (this._updater === null) {
			return;
		}
		const value = this._updater.data;
		const projects: Projects2ProjectDisplay[] = [];
		for (const project of value.projects) {
			const display = document.createElement('elements-projects2-project-display') as Projects2ProjectDisplay;
			display.updater = project;
			projects.push(display);
		}
		requestAnimationFrame(() => {
			this._project_list.textContent = '';
			this._name.textContent = value.name;
			this._desc.textContent = value.desc;
			for (const project of projects) {
				this._project_list.append(project);
			}
		});
	}
	get updater() {
		return this._updater;
	}
	set updater(value) {
		if (this._updater !== null) {
			this._updater.removeListener(this._refresh_callback);
		}
		this._updater = value;
		if (value !== null) {
			value.addListener(this._refresh_callback);
		}
		this._refresh();
	}
	static get observedAttributes() {
		return [];
	}

}

export default Projects2Project_groupDisplay;

Elements.elements.Projects2Project_groupDisplay = Projects2Project_groupDisplay;

Elements.load(Projects2Project_groupDisplay, 'elements-projects2-project_group-display');
