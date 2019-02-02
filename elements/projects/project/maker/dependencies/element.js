'use strict';

Elements.get('draggable-container', 'draggable-Common', 'projects-Project', 'projects-project-display');
{
/**
 * Base class for internal drag listener
 * @private
 */
class DragListener {
	constructor (origin) {
		this.origin = origin;
	}
}
/**
 * Listener for drags outside the dependency tracker
 * @extends DragListener
 * @implements DraggableListener
 */
class DragListenerExternal extends DragListener {
	drag_start (caller, event) {
		this.origin._showExternalDrag();
	}
	drag_end (caller, event) {
		this.origin._showInternalDrag();
	}
}
/**
 * Listener for drags inside the dependency tracker
 * @extends DragListener
 * @implements DraggableListener
 */
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
 * Tracker for dependencies in object currently editted.
 * @augments Elements.elements.backbone2
 * @implements DraggableObserver
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
	/**
	 * Shows panel to accept external drags
	 * @private
	 */
	_showExternalDrag () {
		this._toggleDragShown(true);
	}
	/**
	 * Shows panel to accept internal drags
	 * @private
	 */
	_showInternalDrag () {
		this._toggleDragShown(false);
	}
	/**
	 * Change which internal panel to display
	 * @param  {Boolean} external Whether to display the external or internal panel
	 * @private
	 */
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
	/**
	 * Add a project to the tracker
	 * @param {Number} id ID of project to add
	 */
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
		this._projects.add(id);
		this._project_displays.set(id, div);
		requestAnimationFrame((e) => {
			div.append(display);
			displayHolder.append(div);
		});
	}
	/**
	 * Remove a project from the tracker
	 * @param  {Number} id ID of the project to remove
	 */
	removeProject (id) {
		if (!this._projects.has(id)) {
			throw new Error('Attempted to remove an invalid project');
		}
		let display = this._project_displays.get(id);
		this._project_displays.delete(id);
		this._projects.delete(id);
		requestAnimationFrame((e) => {
			display.remove();
		});
	}
	/**
	 * Get a list of the IDs of projects in the tracker
	 * @return {List<Number>} List of project IDs
	 */
	get contents () {
		return [...this._projects];
	}
	/**
	 * Remove all projects from the tracker
	 */
	clear () {
		for (let id of this._projects) {
			this.removeProject(id);
		}
	}
};

Elements.load(Elements.elements.ProjectsProjectMakerDependencies, 'elements-projects-project-maker-dependencies');
};

main();
}
