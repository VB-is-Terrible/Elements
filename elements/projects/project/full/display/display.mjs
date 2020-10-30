export const recommends = ['grid'];
export const requires = [];

import {Elements} from '../../../../elements_core.js';

const LENGTH_LIMIT = 30;

/**
 * Limit length of text for sane display
 * @param  {String} text Text to shorten
 * @return {String}      Shortened text
 * @protected
 */
const limitLength = (text) => {
	if (text.length > LENGTH_LIMIT) {
		return text.substr(0, LENGTH_LIMIT - 3) + "...";
	} else {
		return text;
	}
}

/**
 * Read only display of a project. Designed to take up the entire page width
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class ProjectsProjectFullDisplay extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectFullDisplay';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._data = null;
		this._refresh_callback = (change_set) => {this._display(this._data);};
		shadow.appendChild(template);
		this.applyPriorProperties('data');
	}
	connectedCallback () {
		super.connectedCallback();
		if (this._data !== null) {
			this._data.add_post_transaction(this._refresh_callback);
			this._display(this._data);
		}
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		if (this._data !== null) {
			this._data.remove_post_transaction(this._refresh_callback);
		}
	}
	static get observedAttributes () {
		return [];
	}
	get data () {
		return this._data;
	}
	/**
	 * Set project to show
	 * @param  {Projects.Project} value Project to show
	 */
	set data (value) {
		if (this._data !== null) {
			this._data.remove_post_transaction(this._refresh_callback);
		}
		this._data = value;
		if (value === null) {
			return;
		}
		this._display(value);
		if (this.connected) {
			value.add_post_transaction(this._refresh_callback);
		}
	}
	/**
	 * Show the project
	 * @param  {Projects.Project} value Project to show
	 */
	_display (value) {
		this._writeStatus(value.status);
		this._writeMeta(value.meta);
		this._writeDesc(value.desc);
		this._writeProgress(value.required, value.progress, value.counter);
		this._writeDependencies(value.dependencies);
	}
	/**
	 * Update the displayed Major Status
	 * @param  {Projects.Status} status Status to display
	 */
	_writeStatus (status) {
		this._writeElement(status.major_code, '#projectMajor');
		this._writeElement(status.minor_code, '#projectMinor');
	}
	/**
	 * Update the displayed Meta value
	 * @param  {Boolean} updateValue Meta value to display
	 */
	_writeMeta (updateValue) {
		const writeElement = this.shadowRoot.querySelector('#projectMeta');
		requestAnimationFrame((e) => {
			writeElement.checked = updateValue;
		});
	}
	/**
	 * Show the project description
	 * @param  {String} updateValue The description to show
	 */
	_writeDesc (updateValue) {
		this._writeElement(updateValue, '#pageDesc');
	}
	/**
	 * Display the project's progress
	 * @param  {Integer} required Progress needed to complete the project
	 * @param  {Integer} progress Current progress of the progject
	 * @param  {Boolean} counter Whether the project is single goal or multiple
	 */
	_writeProgress (required, progress, counter) {
		let multi = this.shadowRoot.querySelector('#progressMulti');
		let single = this.shadowRoot.querySelector('#progressSingle');
		let progress_bar = this.shadowRoot.querySelector('#projectProgress');
		if (!counter) {
			let p = this.shadowRoot.querySelector('#projectProgressOverall');
			requestAnimationFrame((e) => {
				p.innerHTML = Projects.STATUS_CODES_MAJOR[progress];
			});
		} else {
			let progress_current = this.shadowRoot.querySelector('#projectProgressCurrent');
			let progress_total = this.shadowRoot.querySelector('#projectProgressTotal');
			requestAnimationFrame((e) => {
				progress_current.innerHTML = progress.toString();
				progress_total.innerHTML = required.toString();
				progress_bar.value = progress;
				progress_bar.max = required;
			});
		}
		requestAnimationFrame((e) => {
			multi.style.display = !counter ? 'none' : 'flex';
			single.style.display = !counter ? 'flex' : 'none';
			progress_bar.style.display = !counter ? 'none' : 'initial';
		});
	}
	/**
	 * Show the dependencies, with links
	 * @param  {Number[]} dependencies IDs of dependencies
	 * @private
	 */
	_writeDependencies (dependencies) {
		let dependDiv = this.shadowRoot.querySelector('#projectDepends');
		requestAnimationFrame((e) => {
			dependDiv.innerHTML = '';
		});
		let first = true;
		for (let id of dependencies) {
			let a = document.createElement('a');
			let p = document.createElement('p');
			p.className = 'spacer';
			a.href = './' + id.toString();
			p.innerHTML = limitLength(Projects.main_project.get_event_by_id(id).name);
			a.append(p);
			let comma = document.createElement('p');
			comma.innerHTML = ', ';
			requestAnimationFrame((e) => {
				if (!first) {
					dependDiv.append(comma);
				}
				dependDiv.append(a);
				first = false;
			});
		}
	}
	/**
	 * Find an element in the shadowRoot by the selector, then set
	 * the innerHTML to the updateValue
	 * @param  {String} updateValue String to update innerHTML to
	 * @param  {String} selector    CSS selector to find element to update
	 * @private
	 */
	_writeElement (updateValue, selector) {
		const writeElement = this.shadowRoot.querySelector(selector);
		requestAnimationFrame((e) => {
			writeElement.innerHTML = updateValue;
		});
	}
}

export {ProjectsProjectFullDisplay};
export default ProjectsProjectFullDisplay;

Elements.load(ProjectsProjectFullDisplay, 'elements-projects-project-full-display');
