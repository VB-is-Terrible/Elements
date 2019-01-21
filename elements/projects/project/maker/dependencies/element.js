'use strict';

Elements.get('draggable-container', 'draggable-Common', 'projects-Project', 'projects-project-display');
{

class DragListener {
	constructor (origin) {
		this.origin = origin;
	}
}
class DragListenerExternal extends DragListener {
	drag_start (caller, event) {
		this.origin._showExternalDrag();
	}
	drag_end (caller, event) {
		this.origin._showInternalDrag();
	}
}
class DragListenerInternal extends DragListener {
	drag_start (caller, event) {
		this.origin._showInternalDrag();
	}
	drag_end (caller, event) {
	}
};

const main = async () => {

await Elements.get('projects-Project');

const INTERNAL_CONTEXT = 'project-maker';
const EXTERNAL_CONTEXT = Projects.common_type;

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
		this._external_listener = new DragListenerExternal(this);
		this._internal_listener = new DragListenerInternal(this);
		/**
		 * Set of projects currently listed as dependencies
		 * @type {Set<Number>}
		 * @private
		 */
		this._projects = new Set();
		this._project_displays = new Map();
		/**
		 * Map of project ids to displays
		 * @type {Map<Number, Elements.elements.ProjectsProjectDisplay>}
		 * @private
		 */
		this._displays = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		template.querySelector('#dropContainer').context = EXTERNAL_CONTEXT;
		//Fancy code goes here
		shadow.appendChild(template);
		this._showInternalDrag();

	}
	connectedCallback () {
		super.connectedCallback();
		Elements.common.draggable_controller.addListener(this._external_listener, EXTERNAL_CONTEXT);
		Elements.common.draggable_controller.addListener(this._internal_listener, INTERNAL_CONTEXT);
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		Elements.common.draggable_controller.removeListener(this._external_listener, EXTERNAL_CONTEXT);
		Elements.common.draggable_controller.removeListener(this._internal_listener, INTERNAL_CONTEXT);
	}
	item_drag_start (caller, event) {

	}
	item_drop (caller, event) {
		if (caller === this.shadowRoot.querySelector('#dropContainer')) {
			this.addProject(parseInt(event.dataTransfer.getData(Projects.common_type)));
		} else if (caller === this.shadowRoot.querySelector('#removeArea')) {
			this.removeProject(parseInt(event.dataTransfer.getData(Projects.common_type)));
			console.log('Would have removed project');
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
		if (this._projects.has(id)) {
			return;
		}
		let project = DATA.get_event_by_id(id);
		let display = document.createElement('elements-projects-project-display');
		display.data = project;
		display.context = INTERNAL_CONTEXT;
		let displayHolder = this.shadowRoot.querySelector('#projectContainer');
		let div = document.createElement('div');
		div.append(display);
		displayHolder.append(div);
		this._projects.add(id);
		this._project_displays.set(id, div);
	}
	removeProject (id) {
		if (!this._projects.has(id)) {
			throw new Error('Attempted to remove an invalid project');
		}
		let display = this._project_displays.get(id);
		display.remove();
		this._project_displays.delete(id);
		this._projects.delete(id);
	}
};

Elements.load(Elements.elements.ProjectsProjectMakerDependencies, 'elements-projects-project-maker-dependencies');
};

main();
}
