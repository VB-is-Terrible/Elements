export const recommends = ['projects-project-full-display', 'projects-project-full-editor'];
export const requires = [];

import {Elements} from '../../../Elements.mjs';

const DISPLAY_SELECTOR = 'elements-projects-project-full-display';
const EDIT_SELECTOR = 'elements-projects-project-full-editor';

/**
 * Full display for a project. Designed to be shown on it's own page
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
export class ProjectsProjectFull extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectFull';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._data = null;
		shadow.appendChild(template);
		this.applyPriorProperties('data');
	}
	connectedCallback () {
		super.connectedCallback();
	}
	disconnectedCallback () {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return [];
	}
	get data () {
		return this._data;
	}
	/**
	 * Set project to show
	 * @param  {Projects.Project} value [description]
	 */
	set data (value) {
		this._data = value;
		if (value === null) {
			return;
		}
		this.shadowRoot.querySelector(DISPLAY_SELECTOR).data = value;
		this.shadowRoot.querySelector(EDIT_SELECTOR).data = value;
	}
	_rotate () {
		let rotate = this.shadowRoot.querySelector('#rotate');
		const states = [
			{'transform':'translate(0px, 0px) rotateX(0deg)'},
			{'transform':'translate(0px, -50%) rotateX(90deg)'}
		];
		rotate.animate(states,
			{duration : Elements.animation.LONG_DURATION * 2});
	}
}

Elements.elements.ProjectsProjectFull = ProjectsProjectFull;

Elements.load(Elements.elements.ProjectsProjectFull, 'elements-projects-project-full');
