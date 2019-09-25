export const recommends = [];
export const requires = [];

import {Elements} from '../../../../Elements.mjs';

/**
 * [ProjectsProjectFullEditor Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
export class ProjectsProjectFullEditor extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectFullEditor';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);
		/**
		 * Underlying project been edited
		 * @type {Projects.Project}
		 */
		this._data = null;
		// UI update handlers

		shadow.appendChild(template);
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
	 * Set project to edit
	 * @param {?Projects.Project} value
	 */
	set data (value) {
		this.reset();
		this._data = value;
		if (value === null) {
			return;
		}
		this._display(value);
	}
	/**
	 * Reset the editor state
	 */
	reset () {

	}
	/**
	 * Show the project state for editing
	 * @param  {Projects.Project} project Project to show
	 */
	_display (project) {
		this._writeMeta(project.meta);
		this._writeDesc(project.desc);
		this._writeProgress(project.required, project.progress);
		this._writeDependencies(project.dependencies);
		this._writeTitle(project.name);
	}
	_writeElement (updateValue, selector) {
		const writeElement = this.shadowRoot.querySelector(selector);
		requestAnimationFrame((e) => {
			writeElement.innerHTML = updateValue;
		});
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
		this._writeElement(updateValue, '#projectDesc');
	}
	/**
	 * Show the dependencies, with links
	 * @param  {Number[]} dependencies IDs of dependencies
	 * @private
	 */
	_writeDependencies (dependencies) {
		// TODO: Make an element that shows dependencies
	}
	_writeTitle (title) {
		this._writeElement(title, '#pageTitle');
		const input = this.shadowQuery('#Title');
		requestAnimationFrame((e) => {
			input.value = title;
		});
	}
	/**
	 * Find an element in the shadowRoot by the selector, then set
	 * the innerHTML to the updateValue
	 * @param  {String} updateValue String to update innerHTML to
	 * @param  {String} selector    CSS selector to find element to update
	 * @private
	 */
	_writeElement (updateValue, selector) {
		const writeElement = this.shadowQuery(selector);
		requestAnimationFrame((e) => {
			writeElement.innerHTML = updateValue;
		});
	}
	/**
	 * Write the progress and required state to be edited
	 * @param  {Integer} required Progress required to complete the project
	 * @param  {Integer} progress Current progress of the project
	 */
	_writeProgress (required, progress) {
		const required_checkbox = this.shadowQuery('#AnsProgress');
		const required_input = this.shadowQuery('#AnsProgressAmount');
		if (required === 2) {
			required_checkbox.value = false;
			required_input.disabled = true;
		} else {
			required_checkbox.value = true;
			required_input.disabled = false;
			required_input.value = required;
		}

		const progress_value = this.shadowQuery('#projectProgressValue');
		const progress_range = this.shadowQuery('projectProgressRange');
		progress_value.innerHTML = progress.toString();
		// TODO: write
	}
}

Elements.elements.ProjectsProjectFullEditor = ProjectsProjectFullEditor;

Elements.load(Elements.elements.ProjectsProjectFullEditor, 'elements-projects-project-full-editor');
