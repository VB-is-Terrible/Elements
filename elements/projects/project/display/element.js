'use strict';

Elements.get('projects-Project', 'draggable-Common', 'draggable-item', 'draggable-container');
{
const main = async () => {

await Elements.get('projects-Project');
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
		this.__data = value;
		this.shadowRoot.querySelector('.name').innerHTML = value.name;
		let status = value.status;
		let display = this.shadowRoot.querySelector('#status');
		let desc = this.shadowRoot.querySelector('p.desc');
		this.shadowRoot.querySelector('p.status').innerHTML = status.minor_code;
		requestAnimationFrame((e) => {
			desc.innerHTML = value.desc;
			display.className = 'border';
			if (status.minor === 0) {
				switch (status.major) {
					case 0:
						display.classList.add('not_started');
						break;
					case 1:
						display.classList.add('in_progress');
						break;
					case 2:
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
		if (this.data.required > 2) {
			let progress = this.shadowRoot.querySelector('p.progress');
			requestAnimationFrame((e) => {
				progress.innerHTML = this.data.progress.toString() + ' / ' +
				                     this.data.required.toString();
			});
		}

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
	static get observedAttributes () {
		return ['context', 'effect_allowed', 'drop_effect'];
	}
};

Elements.load(Elements.elements.ProjectsProjectDisplay, 'elements-projects-project-display');
};

main();
}