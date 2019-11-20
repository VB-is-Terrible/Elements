export const recommends = ['projects-project-full-display', 'projects-project-full-editor', 'container-rotate'];
export const requires = [];

import {Elements} from '../../../Elements.mjs';

const DISPLAY_SELECTOR = 'elements-projects-project-full-display';
const EDIT_SELECTOR = 'elements-projects-project-full-editor';

/**
 * Full display for a project. Designed to be shown on it's own page
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 * @property {Projects.Project} data The Project to show/edit
 * @property {Boolean} editmode Which mode to show
 */
class ProjectsProjectFull extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectFull';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._refresh_callback = (changed) => {this._display();};
		this._data = null;
		this._editmode = false;
		this._display_animation = null;
		this._editor_animation = null;
		template.querySelector('#edit').addEventListener('click', (e) => {
			this.change_mode();
		});
		shadow.appendChild(template);
		this.applyPriorProperties('data');
		this.applyPriorProperty('editmode', false);
	}
	connectedCallback () {
		super.connectedCallback();
		if (this._data !== null) {
			this._data.add_post_transaction(this._refresh_callback);
			this._display();
		}
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		if (this._data !== null) {
			this._data.remove_post_transaction(this._refresh_callback);
		}
	}
	static get observedAttributes () {
		return ['editmode'];
	}
	get data () {
		return this._data;
	}
	/**
	 * Set project to show
	 * @param  {Projects.Project} value [description]
	 */
	set data (value) {
		if (this._data !== null) {
			this._data.remove_post_transaction(this._refresh_callback);
		}
		this._data = value;
		if (value === null) {
			return;
		}
		if (this.connected) {
			this._data.add_post_transaction(this._refresh_callback);
		}
		this.shadowRoot.querySelector(DISPLAY_SELECTOR).data = value;
		this.shadowRoot.querySelector(EDIT_SELECTOR).data = value;
		this._display();
	}
	get editmode () {
		return this._editmode;
	}
	set editmode (value) {
		let new_mode = Elements.booleaner(value);
		if (this._editmode === new_mode) {return;}
		this._editmode = new_mode;
		if (this.attributeInit) {
			this.setAttribute('editmode', value.toString());
		}
		let edit_button = this.shadowQuery('#edit');
		requestAnimationFrame((e) => {
			if (new_mode) {
				edit_button.innerHTML = 'Cancel';
			} else {
				edit_button.innerHTML = 'Edit';
			}
		});
		let rotator = this.shadowQuery('elements-container-rotate');
		if (new_mode) {
			rotator.current = 's2';
		} else {
			rotator.current = 's1';
		}
		if (!new_mode) {
			let editor = this.shadowQuery('elements-projects-project-full-editor');
			editor.cancel();
		}
	}
	/**
	 * Update the project (title) display
	 * @private
	 */
	_display () {
		this._writeTitle(this._data.name);
	}
	/**
	 * Show the project title
	 * @param  {String} title Title to show
	 * @private
	 */
	_writeTitle (title) {
		let title_display = this.shadowQuery('#pageTitle');
		requestAnimationFrame((e) => {
			title_display.innerHTML = Elements.nameSanitizer(title);
		});
	}
	/**
	 * Toggle between edit and display mode
	 */
	change_mode () {
		this.editmode = !this._editmode;
	}
}

export {ProjectsProjectFull};
export default ProjectsProjectFull;

Elements.load(ProjectsProjectFull, 'elements-projects-project-full');
