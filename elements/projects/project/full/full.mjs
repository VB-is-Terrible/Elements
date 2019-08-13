export const recommends = ['projects-project-full-display'];
export const requires = [];

import {Elements} from '../../../Elements.mjs';

const LENGTH_LIMIT = 30;

/**
 * Limit length of text for sane display
 * @param  {String} text Text to shorten
 * @return {String}      Shortened text
 */
const limitLength = (text) => {
	if (text.length > LENGTH_LIMIT) {
		return text.substr(0, LENGTH_LIMIT - 3) + "...";
	} else {
		return text;
	}
}

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
		this.shadowRoot.querySelector('elements-projects-project-full-display').data = value;
	}
	_rotate () {
		let rotate = this.shadowRoot.querySelector('#rotate');
		const states = [{'transform':'translate(0px, 0px) rotateX(0deg)'}, {'transform':'translate(0px, -50%) rotateX(90deg)'}];
		rotate.animate(states, {duration : Elements.animation.LONG_DURATION * 2});
	}
}

Elements.elements.ProjectsProjectFull = ProjectsProjectFull;

Elements.load(Elements.elements.ProjectsProjectFull, 'elements-projects-project-full');
