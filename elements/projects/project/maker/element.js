'use strict';

Elements.get('drag-element', 'projects-Project');
{
const main = async () => {

await Elements.get('drag-element', 'draggable-Common', 'projects-project-maker-dependencies');
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
		for (let input of template.querySelectorAll('input')) {
			if (input.type === 'text') {
				input.addEventListener('mousedown', (e) => {
					e.stopPropagation();
				});
			}
		}
		let progress = template.querySelector('#AnsProgress');
		let progressAmount = template.querySelector('#AnsProgressAmount');
		progress.addEventListener('change', (e) => {
			progressAmount.disabled = !progress.checked;
		})
		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperty('database', null);
	}
	create () {
		if (!Elements.loadedElements.has('projects-Project')) {
			console.log('Core js has not loaded');
			return;
		}
		let name = this.shadowRoot.querySelector('#AnsName').value;
		let desc = this.shadowRoot.querySelector('#AnsDesc').value;
		let progress = this.shadowRoot.querySelector('#AnsProgress').checked;
		let progressAmount = this.shadowRoot.querySelector('#AnsProgressAmount').value;
		let meta = this.shadowRoot.querySelector('#AnsMeta').checked;
		let project = new Projects.Project(this.database, name, null, desc, progress ? progressAmount : undefined);
		// TODO: Add feedback
		if (name === '') {return;}
		project.meta = meta ? 1 : 0;
		// TODO: Add dependencies
		this.send_create(project);
	}
	async send_create (project) {
		// this.hideWindow();
		this.clear();
		let result = await this.database.add_project(project);
		if (!result) {
			// TODO: Add notification
		}
	}
	clear () {
		let name = this.shadowRoot.querySelector('#AnsName');
		let desc = this.shadowRoot.querySelector('#AnsDesc');
		let progress = this.shadowRoot.querySelector('#AnsProgress');
		let progressAmount = this.shadowRoot.querySelector('#AnsProgressAmount');
		let meta = this.shadowRoot.querySelector('#AnsMeta');
		name.value = '';
		desc.value = '';
		progress.checked = false;
		progressAmount.value = null;
		meta.checked = false;
	}
};

Elements.load(Elements.elements.ProjectsProjectMaker, 'elements-projects-project-maker');
};

main();
}
