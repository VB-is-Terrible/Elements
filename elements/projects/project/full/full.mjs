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

		this._refresh_callback = (changed) => {this._display();};
		this._data = null;
		this._editmode = false;
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
		this._rotate(value);
	}
	_rotate (editmode) {
		let display = this.shadowRoot.querySelector('#displayRotate');
		let editor = this.shadowQuery('#editorRotate');
		const states_up = [
			{'transform':'translate(0px, 0px) rotateX(0deg)'},
			{'transform':'translate(0px, -50%) rotateX(90deg)'}
		];
		const states_down = [
			{'transform':'translate(0px, 50%) rotateX(-90deg)'},
			{'transform':'translate(0px, 0px) rotateX(0deg)'},
		];
		let options = {
			duration : Elements.animation.LONG_DURATION * 2,
		};

		if (editmode) {
			options.fill = 'forwards';
		} else {
			options.fill = 'backwards';
		}

		let display_animation = display.animate(states_up, options);
		let editor_animation = editor.animate(states_down, options);
		if (!editmode) {
			display_animation.reverse();
			editor_animation.reverse();
		}

	}
	/**
	 * Update the project (title) display
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
	change_mode () {
		this.editmode = !this._editmode;
	}
}

Elements.elements.ProjectsProjectFull = ProjectsProjectFull;

Elements.load(Elements.elements.ProjectsProjectFull, 'elements-projects-project-full');
