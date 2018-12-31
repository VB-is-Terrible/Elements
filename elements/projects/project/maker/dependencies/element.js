'use strict';

Elements.get('draggable-container', 'draggable-Common', 'projects-Project', 'projects-project-display');
{
const EXTERNAL_CONTEXT = 'project-common';
const INTERNAL_CONTEXT = 'project-maker';

class DragListenerExternal {
	constructor (origin) {
		this.origin = origin;
	}
	drag_start (caller, event) {
		this.origin._showExternalDrag();
	}
	drag_end (caller, event) {
		this.origin._showInternalDrag();
	}
}

const main = async () => {

await Elements.get('projects-Project');
/**
 * [ProjectsProjectMakerDependencies Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.ProjectsProjectMakerDependencies = class ProjectsProjectMakerDependencies extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectMakerDependencies';
		this._listener = new DragListenerExternal(this);
		/**
		 * Set of projects currently listed as dependencies
		 * @type {Set<Number>}
		 * @private
		 */
		this._projects = new Set();
		/**
		 * Map of project ids to displays
		 * @type {Map<Number, Elements.elements.ProjectsProjectDisplay>}
		 * @private
		 */
		this._displays = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
		this._showInternalDrag();

	}
	connectedCallback () {
		super.connectedCallback();
		Elements.common.draggable_controller.addListener(this._listener, EXTERNAL_CONTEXT);
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		Elements.common.draggable_controller.removeListener(this._listener, EXTERNAL_CONTEXT);
	}
	item_drag_start (caller, event) {

	}
	item_drop (caller, event) {
		if (caller === this.shadowRoot.querySelector('#dropContainer')) {
			this.addProject(parseInt(event.dataTransfer.getData(Projects.common_type)));
		} else if (caller === this.shadowRoot.querySelector('#removeArea')) {
			// Remove project
		} else {
			console.warn('Unknown item_drop caller: ', caller);
		}
		this._showInternalDrag();
	}
	_showExternalDrag () {
		this._toggleDragShown(true);
	}
	_showInternalDrag () {
		this._toggleDragShown(false);
	}
	_toggleDragShown (external) {
		let externalDrag = this.shadowRoot.querySelector('#dropZone');
		let internalDrag = this.shadowRoot.querySelector('#contents');
		if (external) {
			requestAnimationFrame((e) => {
				externalDrag.style.display = '';
				internalDrag.style.display = 'none';
			});
		} else {
			requestAnimationFrame((e) => {
				externalDrag.style.display = 'none';
				internalDrag.style.display = '';
			});
		}
	}
	addProject (id) {
		let project = DATA.get_event_by_id(id);
		let display = document.createElement('elements-projects-project-display');
		display.data = project;
		display.context = INTERNAL_CONTEXT;
		let displayHolder = this.shadowRoot.querySelector('#projectContainer');
		displayHolder.append(display);
	}
};

Elements.load(Elements.elements.ProjectsProjectMakerDependencies, 'elements-projects-project-maker-dependencies');
};

main();
}
