'use strict';

Elements.get('drag-element', 'projects-Project');
{
const main = async () => {

await Elements.get('drag-element', 'draggable-Common', 'projects-project-selection', 'drag-Common');
/**
 * [ProjectsProjectMaker Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.ProjectsProjectMaker = class ProjectsProjectMaker extends Elements.elements.dragged2 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectMaker';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let done = template.querySelector('#Done');
		done.addEventListener('click', (e) => {
			self.create();
		});
		let cancel = template.querySelector('#Cancel');
		cancel.addEventListener('click', (e) => {
			self.clear();
		});
		Elements.common.stop_drag_events(template);
		let progress = template.querySelector('#AnsProgress');
		let progressAmount = template.querySelector('#AnsProgressAmount');
		progress.addEventListener('change', (e) => {
			progressAmount.disabled = !progress.checked;
		})
		//Fancy code goes here
		shadow.appendChild(template);
	}
	create () {
		if (!Elements.loadedElements.has('projects-Project')) {
			console.log('Core js has not loaded');
			return;
		}
		let name = this.shadowRoot.querySelector('#AnsName').value;
		let desc = this.shadowRoot.querySelector('#AnsDesc').value;
		let progress = this.shadowRoot.querySelector('#AnsProgress').checked;
		let progressAmount = parseInt(this.shadowRoot.querySelector('#AnsProgressAmount').value);
		let meta = this.shadowRoot.querySelector('#AnsMeta').checked;
		let dependencies = this.shadowRoot.querySelector('#depend').contents;
		if (!progress) {
		} else if (isNaN(progressAmount)) {
			return;
		} else if (progressAmount < 1) {
			return;
		}
		let project = new Projects.Project(
			Projects.main_project,
			name,
			null,
			desc,
			progress ? progressAmount : undefined
		);
		project.dependencies = dependencies;
		// TODO: Add feedback
		if (name === '') {return;}
		project.meta = meta ? 1 : 0;
		this.send_create(project);
	}
	async send_create (project) {
		// this.hideWindow();
		this.clear();
		let result = await Projects.main_project.add_project(project);
		if (!result) {
			console.log('Failed to contact the server');
			// TODO: Add notification
		}
	}
	clear () {
		let name = this.shadowRoot.querySelector('#AnsName');
		let desc = this.shadowRoot.querySelector('#AnsDesc');
		let progress = this.shadowRoot.querySelector('#AnsProgress');
		let progressAmount = this.shadowRoot.querySelector('#AnsProgressAmount');
		let meta = this.shadowRoot.querySelector('#AnsMeta');
		let depend = this.shadowRoot.querySelector('#depend');
		name.value = '';
		desc.value = '';
		progress.checked = false;
		progressAmount.value = null;
		meta.checked = false;
		depend.clear();
	}
};

Elements.load(Elements.elements.ProjectsProjectMaker, 'elements-projects-project-maker');
};

main();
}
