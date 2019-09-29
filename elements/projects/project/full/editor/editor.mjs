export const recommends = ['projects-Project'];
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
		template.querySelector('#cancel').addEventListener(
			'click',
			(e) => {this.cancel(e);});
		template.querySelector('#Title').addEventListener(
			'input',
			(e) => {this._changeTitle(e);});
		template.querySelector('#AnsProgress').addEventListener(
			'input',
			(e) => {this._changeCounter(e);});
		template.querySelector('#AnsProgressAmount').addEventListener(
			'input',
			(e) => {this._changeRequired(e, false);});
		template.querySelector('#AnsProgressAmount').addEventListener(
			'change',
			(e) => {this._changeRequired(e, true);});
		template.querySelector('#projectProgressRange').addEventListener(
			'input',
			(e) => {this._changeProgress(e);});
		template.querySelector('#projectProgressDecrease').addEventListener(
			'click',
			(e) => {this._decrementProgress(e);});
		template.querySelector('#projectProgressIncrease').addEventListener(
			'click',
			(e) => {this._incrementProgress(e);});
		template.querySelector('#projectMeta').addEventListener(
			'change',
			(e) => {this._changeMeta(e);});
		template.querySelector('#projectDesc').addEventListener(
			'input',
			(e) => {this._changeDescription(e);});
		template.querySelector('#accept').addEventListener(
			'click',
			(e) => {this._accept(e);})
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
		this._changes.progress_counter = value.progress;
		this._changes.required_amount = value.required;
		this._changes.required_counter = value.required;
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
	/**
	 * Set all the input fields to sane placeholder values
	 * @private
	 */
	_resetChanges () {
		this._changes = {
			required_amount: 0,
			required_counter: 0,
			progress_amount: 0,
			progress_counter: 0,
			counter: false,
		};
	}
	/**
	 * Show the project state for editing
	 * @param  {Projects.Project} project Project to show
	 * @private
	 */
	_display (project) {
		this._writeMeta(project.meta);
		this._writeDesc(project.desc);
		this._writeProgress(project.required, project.progress, project.counter);
		this._writeDependencies(project.dependencies);
		this._writeTitle(project.name);
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
		this.shadowQuery('#projectDesc').value = updateValue;
	}
	/**
	 * Show the dependencies, with links
	 * @param  {Number[]} dependencies IDs of dependencies
	 * @private
	 */
	_writeDependencies (dependencies) {
		// : Make an element that shows dependencies
	}
	/**
	 * Show the project title
	 * @param  {String} title Title to show
	 * @private
	 */
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
	 * Display the required, progress and counter in this._changes
	 */
	_writeProgressFromChanges () {
		this._writeProgress(this._changes.required_amount,
		                    this._changes.progress_amount,
			            this._changes.counter);
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
	/**
	 * Respond to an input on the title input
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_changeTitle (e) {}
	/**
	 * Respond to an input on the counter checkbox
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_changeCounter (e) {
		const required_input = this.shadowQuery('#AnsProgressAmount');
		this._changes.counter = e.path[0].checked;
		if (this._changes.counter) {
			requestAnimationFrame((e) => {
				required_input.disabled = false;
			});
			this._changes.required_amount = this._changes.required_counter;
			this._changes.progress_amount = this._changes.progress_counter;
			this._writeProgressFromChanges();
		} else {
			requestAnimationFrame((e) => {
				required_input.disabled = true;
			});
			this._changes.required_amount = Projects.MAX_STATUS;
			this._changes.progress_amount = Math.min(this._changes.progress_counter, Projects.MAX_STATUS);
		    	this._writeProgressFromChanges();
		}
	}
	/**
	 * Respond to an input on the required input
	 * @param  {Event} e User event that trigger this function
	 * @param  {Boolean} reset Whether to change the input value back to a sane value, or to ignore invalid inputs
	 * @private
	 */
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
			this._changes.required_counter = value;
			this._changes.progress_amount = Math.min(this._changes.progress_amount, value);
			this._writeProgressFromChanges();
		}
	}
	/**
	 * Respond to an input on the progress range
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_changeProgress (e) {
		let progress = e.path[0].value;
		this._setProgress(progress);
	}
	/**
	 * Respond to an input on the progress increment button
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_incrementProgress (e) {
		let new_progress = Math.min(
			this._changes.progress_amount + 1,
		        this._changes.required_amount);
		this._setProgress(new_progress);
	}
	/**
	 * Respond to an input on the progress decrement button
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_decrementProgress (e) {
		let new_progress = Math.max(
			this._changes.progress_amount - 1,
			0);
		this._setProgress(new_progress);
	}
	/**
	 * Respond to an input on the meta checkbox
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_changeMeta (e) {}
	/**
	 * Respond to an input on the description field
	 * @param  {Event} e User event that trigger this function
	 * @private
	 */
	_changeDescription (e) {}
	/**
	 * Set and update the progress value
	 * @param {Integer} progress Progress to update to
	 */
	_setProgress (progress) {
		this._changes.progress_amount = progress;
		this._changes.progress_counter = progress;
		this._writeProgressFromChanges();
	}
	/**
	 * Respond to an user cancelling an edit
	 */
	cancel () {
		this.data = this.data;
	}
	/**
	 * Respond to an user accepting the changes so far
	 * @param  {Event} [e] User event that trigger this function
	 */
	accept (e) {
		let change_set = this._make_change_set();
		console.log('Built changeset: ', change_set);
		return;
		this.reset();
		this.send_change(change_set);
	}
	/**
	 * Send the change_set to the server
	 * @param  {Projects.ChangeSet}  change_set ChangeSet to send
	 */
	async send_change (change_set) {
		let result = await Projects.main_project.change_project(change_set);
		if (!result) {
			console.log('Failed to contact the server');
		}
	}
	/**
	 * Make a ChangeSet based on the current inputs
	 * @return {Projects.ChangeSet}      The current inputs put into a ChangeSet
	 */
	_make_change_set () {
		let change_set = new Projects.ChangeSet(this.data.id);
		let title = this.shadowQuery('#title').value;
		if (title !== this.data.name) {
			change_set.name = title;
		}
		let desc = this.shadowQuery('#projectDesc').value;
		if (desc !== this.data.desc) {
			change_set.desc = desc;
		}
		let required = parseInt(this.shadowQuery('#AnsProgressAmount').value);
		if (required === NaN || required < 1) {
			console.warn('Invalid required value');
		} else if (required !== this.data.required) {
			change_set.required = required;
		}
		let progress = parseInt(this.shadowQuery('#projectProgressRange'));
		if (progress !== this.data.progress) {
			change_set.progress = progress;
		}
		let meta = this.shadowQuery('#projectMeta').checked;
		if (meta !== this.data.meta) {
			change_set.meta = meta;
		}
		let counter = this.shadowQuery('#AnsProgress').checked;
		if (counter !== this.data.counter) {
			change_set.counter = counter;
		}
		// TODO: Track dependencies
		return change_set;
	}
}

Elements.elements.ProjectsProjectFullEditor = ProjectsProjectFullEditor;

Elements.load(Elements.elements.ProjectsProjectFullEditor, 'elements-projects-project-full-editor');
