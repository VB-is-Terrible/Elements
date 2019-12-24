export const recommends = ['projects-project-full-display', 'projects-project-full-editor', 'container-rotate', 'projects-project-selection'];
export const requires = [];

import {Elements} from '../../../Elements.mjs';

const DISPLAY_SELECTOR = 'elements-projects-project-full-display';
const EDIT_SELECTOR = 'elements-projects-project-full-editor';
const DEPEND_SELECTOR = 'elements-projects-project-selection';

/**
 * Full display for a project. Designed to be shown on it's own page
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 * @property {Projects.Project} data The Project to show/edit
 * @property {Integer} editmode Which mode to show, 0 = Overview, 1 = Basic editor, 2 = Dependencies editor
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
		this._editmode = 0;
		this._display_animation = null;
		this._editor_animation = null;
		template.querySelector('#overview').addEventListener('click', (e) => {
			this.editmode = 0;
		});
		template.querySelector('#editor').addEventListener('click', (e) => {
			this.editmode = 1;
		});
		template.querySelector('#depend').addEventListener('click', (e) => {
			this.editmode = 2;
		});
		shadow.appendChild(template);
		this.applyPriorProperties('data');
		this.applyPriorProperty('editmode', 0);
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
		const depend = this.shadowRoot.querySelector(DEPEND_SELECTOR)
		depend.contents = value.dependencies;
		this._display();
	}
	get editmode () {
		return this._editmode;
	}
	set editmode (value) {
		let new_mode = parseInt(value);
		if (this._editmode === new_mode) {return;}
		this._editmode = new_mode;
		if (this.attributeInit) {
			this.setAttribute('editmode', value.toString());
		}
		let rotator = this.shadowQuery('elements-container-rotate');
		rotator.current = 's' + (new_mode + 1).toString();
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
	_accept (e) {
		let change_set = this.shadowQuery(EDIT_SELECTOR).make_change_set();
		this._send_change_set(change_set);
	}
	/**
	 * Send the change_set to the server
	 * @param  {Projects.ChangeSet}  change_set ChangeSet to send
	 */
	async _send_change_set (change_set) {
		let result = await Projects.main_project.change_project(change_set);
		if (!result) {
			console.log('Failed to contact the server');
		}
	}
}

export {ProjectsProjectFull};
export default ProjectsProjectFull;

Elements.load(ProjectsProjectFull, 'elements-projects-project-full');
