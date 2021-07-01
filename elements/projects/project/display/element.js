'use strict';

Elements.get('projects-Project', 'draggable-Common', 'draggable-item', 'draggable-container');
{
const main = async () => {

await Elements.get('projects-Project');

const PROJECT_SUBPAGE = '/project/';
/**
 * [ProjectsProjectDisplay Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 * @implements DraggableParent
 */

Elements.elements.ProjectsProjectDisplay = class ProjectsProjectDisplay extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectDisplay';
		this.__data = null;
		this._context = '';
		this._refresh_callback = (changed) => {this._refresh();};
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperties('data');
		this.applyPriorProperty('context', Projects.common_type);
	}
	get data() {
		return this.__data;
	}
	set data(value) {
		if (this.data !== null) {
			this.data.remove_post_transaction(this._refresh_callback);
		}
		this.__data = value;
		if (this.connected) {
			this.__data.add_post_transaction(this._refresh_callback);
		}
		this._refresh();
	}
	item_drag_start (caller, event) {
		let parent = Elements.classes.Draggable.getParent(this);
		if (parent === null) {
			throw new Elements.classes.Draggable.DraggableError();
		}
		let effectAllowed = parent.item_drag_start(caller, event);
		event.dataTransfer.setData(Projects.common_type, this.__data.id);
		return effectAllowed;
	}
	item_drop (caller, event) {
		return;
	}
	get context () {
		return this._context;
	}
	set context (value) {
		if (value === this._context) {
			return;
		}
		this._context = value;
		if (this.attributeInit) {
			this.setAttribute('context', value);
		}
		let internals = this._getToChange();
		for (let node of internals) {
			node.context = value;
		}

	}
	_getToChange () {
		return [
			this.shadowRoot.querySelector('elements-draggable-item'),
		];
	}
	_refresh () {
		let value = this.data;
		if (this.data === null) {return;}

		this.shadowRoot.querySelector('.name').textContent = value.name;
		let status = value.status;
		let display = this.shadowRoot.querySelector('#status');
		let desc = this.shadowRoot.querySelector('p.desc');
		let link = this.shadowRoot.querySelector('#editlink');
		this.shadowRoot.querySelector('p.status').textContent = status.minor_code;
		requestAnimationFrame((e) => {
			desc.textContent = value.desc;
			display.className = 'border';
			link.href = Projects.base_location + PROJECT_SUBPAGE + this.__data.id.toString();
			if (status.minor === 0) {
				switch (status.major) {
					case 0:
						display.classList.add('not_started');
						break;
					case Projects.PROGRESS_STATUS:
						display.classList.add('in_progress');
						break;
					case Projects.MAX_STATUS:
						display.classList.add('finished');
						break;
					default:
						display.classList.add('error');
				}
			} else {
				switch (status.minor) {
					case 1:
						display.classList.add('awaiting');
						break;
					default:
						display.classList.add('error');
				}
			}
		});
		if (this.data.counter) {
			let progress = this.shadowRoot.querySelector('p.progress');
			requestAnimationFrame((e) => {
				progress.textContent = this.data.progress.toString() + ' / ' +
						     this.data.required.toString();
			});
		}
	}
	static get observedAttributes () {
		return ['context', 'effect_allowed', 'drop_effect'];
	}
	connectedCallback () {
		super.connectedCallback();
		if (this.data !== null) {
			this.data.add_post_transaction(this._refresh_callback);
			this._refresh();
		}
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		if (this.data !== null) {
			this.data.remove_post_transaction(this._refresh_callback);
		}
	}
};

Elements.load(Elements.elements.ProjectsProjectDisplay, 'elements-projects-project-display');
};

main();
}
