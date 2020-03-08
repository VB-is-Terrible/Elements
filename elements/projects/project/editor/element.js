'use strict';

Elements.get('projects-Project');
{
const main = async () => {

/**
 * @private
 */
class DragListener {
	constructor (origin) {
		this.origin = origin;
	}
	drag_start (caller, event) {
		this.origin._showDropArea();
	}
	drag_end (caller, event) {
		this.origin._showForm();
	}
}



await Elements.get('projects-Project', 'drag-Common');
/**
 * [ProjectsProjectEditor Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.ProjectsProjectEditor = class ProjectsProjectEditor extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectEditor';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		Elements.common.stop_drag_events(template);
		template.querySelector('#dropContainer').context = Projects.common_type;

		this.project = null;
		this._listener = new DragListener(this);
		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback () {
		super.connectedCallback();
		Elements.common.draggable_controller.addListener(this._listener, Projects.common_type);
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		Elements.common.draggable_controller.removeListener(this._listener, Projects.common_type);
	}
	static get observedAttributes () {
		return [];
	}
	setProject (id) {
		/**
		 * Project to show
		 * @type {Projects.Project}
		 */
		let project = Projects.main_project.get_event_by_id(id);
		this.project = id;
		let name = this.shadowRoot.querySelector('#projectName');
		let desc = this.shadowRoot.querySelector('#projectDesc');
		let progress = this.shadowRoot.querySelector('#projectProgress');
		let progressAmount = this.shadowRoot.querySelector('#projectProgressCurrent');
		let progressTotal = this.shadowRoot.querySelector('#projectProgressTotal');
		let statusMajor = this.shadowRoot.querySelector('#projectMajor');
		let statusMinor = this.shadowRoot.querySelector('#projectMinor');
		let meta = this.shadowRoot.querySelector('#projectMeta');
		let selection = this.shadowRoot.querySelector('#depend');
		requestAnimationFrame((e) => {
			name.value = project.name;
			desc.value = project.desc;
			if (project.counter) {
				progress.checked = true;
				progressAmount.value = project.progress;
				progressTotal.value = project.required;
			} else {
				progress.checked = false;
				progressAmount.value = '';
				progressTotal.value = '';
			}
			meta.checked = project.meta;
			statusMajor.innerHTML = project.status.major_code;
			statusMinor.innerHTML = project.status.minor_code;

		});
		selection.clear();
		for (let project_id of project.dependencies) {
			selection.addProject(project_id);
		}
	}
	item_drag_start (caller, event) {

	}
	item_drop (caller, event) {
		let id = parseInt(event.dataTransfer.getData(Projects.common_type));
		console.log('Recieved project: ', id);
		this.setProject(id);
	}
	_showDropArea () {
		this._showDrop(true);
	}
	_showForm () {
		this._showDrop(false);
	}
	_showDrop (visible) {
		let drop = this.shadowRoot.querySelector('#back');
		requestAnimationFrame((e) => {
			drop.style.display = visible ? 'block' : 'none';
		});
	}
};

Elements.load(Elements.elements.ProjectsProjectEditor, 'elements-projects-project-editor');
};

main();
}
