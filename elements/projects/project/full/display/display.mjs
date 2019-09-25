export const recommends = ['grid'];
export const requires = [];

import {Elements} from '../../../../Elements.mjs';

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
 * Read only display of a project. Designed to take up the entire page width
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
export class ProjectsProjectFullDisplay extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectFullDisplay';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		template.querySelector('#edit').addEventListener('click', (e) => {
			self._rotate();
		})
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
		this._writeStatus(value.status);
		this._writeMeta(value.meta);
		this._writeDesc(value.desc);
		this._writeProgress(value.required, value.progress);
		this._writeDependencies(value.dependencies);
		this._writeTitle(value.name);
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
	 */
	_writeProgress (required, progress) {
		let isSingle;
		if (required === 2) {
			isSingle = true;
		} else {
			isSingle = false;
		}
		let multi = this.shadowRoot.querySelector('#progressMulti');
		let single = this.shadowRoot.querySelector('#progressSingle');
		let progress_bar = this.shadowRoot.querySelector('#projectProgress');
		if (isSingle) {
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
			multi.style.display = isSingle ? 'none' : 'flex';
			single.style.display = isSingle ? 'flex' : 'none';
			progress_bar.style.display = isSingle ? 'none' : 'initial';
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
			p.innerHTML = limitLength(DATA.get_event_by_id(id).name);
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
	_writeTitle (title) {
		this._writeElement(title, '#pageTitle');
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
	_rotate () {
		let rotate = this.shadowRoot.querySelector('#rotate');
		const states = [{'transform':'translate(0px, 0px) rotateX(0deg)'}, {'transform':'translate(0px, -50%) rotateX(90deg)'}];
		rotate.animate(states, {duration : Elements.animation.LONG_DURATION * 2});
	}
}

Elements.elements.ProjectsProjectFullDisplay = ProjectsProjectFullDisplay;

Elements.load(Elements.elements.ProjectsProjectFullDisplay, 'elements-projects-project-full-display');
