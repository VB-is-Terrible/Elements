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
		this._resetChanges();
		// UI update handlers
		template.querySelector('#cancel').addEventListener('click', this.cancel);
		template.querySelector('#Title').addEventListener('input',
			(e) => {this._changeTitle(e);});
		template.querySelector('#AnsProgress').addEventListener('input',
			(e) => {this._changeCounter(e);});
		template.querySelector('#AnsProgressAmount').addEventListener('input',
			(e) => {this._changeRequired(e, false);});
		template.querySelector('#AnsProgressAmount').addEventListener('change',
			(e) => {this._changeRequired(e, true);});
		template.querySelector('#projectProgressRange').addEventListener('input',
			(e) => {this._changeProgress(e);});
		template.querySelector('#projectProgressDecrease').addEventListener('click',
			(e) => {this._decrementProgress(e);});
		template.querySelector('#projectProgressIncrease').addEventListener('click',
			(e) => {this._incrementProgress(e);});
		template.querySelector('#projectMeta').addEventListener('change',
			(e) => {this._changeMeta(e);});
		template.querySelector('#projectDesc').addEventListener('input',
			(e) => {this._changeDescription(e);});
		shadow.appendChild(template);
		this.applyPriorProperty('data', null);
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
		this._changes.progress_amount = value.progress;
		this._changes.required_amount = value.required;
		this._changes.counter = value.counter;
	}
	/**
	 * Reset the editor state
	 */
	reset () {
		this._writeMeta(false);
		this._writeDesc('');
		this._writeProgress(1, 1, true);
		this._writeDependencies([]);
		this._writeTitle('Blank Project');
		this._resetChanges();
	}
	_resetChanges () {
		this._changes = {
			required_amount: 0,
			progress_amount: 0,
			counter: false,
		};
	}
	/**
	 * Show the project state for editing
	 * @param  {Projects.Project} project Project to show
	 */
	_display (project) {
		this._writeMeta(project.meta);
		this._writeDesc(project.desc);
		this._writeProgress(project.required, project.progress, project.counter);
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
		// : Make an element that shows dependencies
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
	 * @param  {Boolean} counter Whether the project is single goal or multiple
	 */
	_writeProgress (required, progress, counter) {
		const required_checkbox = this.shadowQuery('#AnsProgress');
		const required_input = this.shadowQuery('#AnsProgressAmount');
		if (!counter) {
			required_checkbox.value = false;
			required_input.disabled = true;
		} else {
			required_checkbox.value = true;
			required_input.disabled = false;
		}
		required_input.value = required;

		const progress_value = this.shadowQuery('#projectProgressValue');
		const progress_range = this.shadowQuery('#projectProgressRange');
		progress_value.innerHTML = progress.toString();
		progress_range.max = required;
		progress_range.value = progress;
	}
	_changeTitle (e) {}
	_changeCounter (e) {
		const required_input = this.shadowQuery('#AnsProgressAmount');
		if (e.path[0].checked) {
			requestAnimationFrame((e) => {
				required_input.disabled = false;
			});
			this._writeProgress(this._changes.required_amount,
			                    this._changes.progress_amount,
				            true);
		} else {
			requestAnimationFrame((e) => {
				required_input.disabled = true;
			});
			this._writeProgress(2,
			                    Math.max(this._changes.progress_amount, 2),
				            false);
		}
		this._changes.counter = e.path[0].checked;
	}
	_changeRequired (e, reset) {
		let input_value = e.path[0].value;
		if (input_value === '') {
			if (reset) {
				e.path[0].value = this._changes.required_amount;
			}
			return;
		} else {
			let value = parseInt(input_value);
			if (value < 1) {
				if (reset) {
					e.path[0].value = this._changes.required_amount;
				}
				return;
			}
			this._changes.required_amount = value;
			this._writeProgress(value,
				            Math.max(this._changes.progress_amount),
				            this._changes.counter);
			this._changes.required_amount = value;
		}
	}
	_changeProgress (e) {
		let progress = e.path[0].value;
		this._changes.progress_amount = progress;
		this._writeProgress(this._changes.required_amount, progress,
		                    this._changes.counter);
	}
	_incrementProgress (e) {}
	_decrementProgress (e) {}
	_changeMeta (e) {}
	_changeDescription (e) {}
	cancel () {
		console.log('Would have reset changes');
	}
}

Elements.elements.ProjectsProjectFullEditor = ProjectsProjectFullEditor;

Elements.load(Elements.elements.ProjectsProjectFullEditor, 'elements-projects-project-full-editor');
