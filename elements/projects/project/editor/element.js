'use strict';

Elements.get('projects-Projects');
{
const main = async () => {

await Elements.get('projects-Projects');
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

		for (let input of template.querySelectorAll('input')) {
			if (input.type === 'text') {
				input.addEventListener('mousedown', (e) => {
					e.stopPropagation();
				});
			}
		}
		for (let textarea of template.querySelector('textarea')) {
			textarea.addEventListener('mousedown', (e) => {
				e.stopPropagation();
			});
		}
		template.querySelector('#dropContainer').context = Projects.common_type;

		this.project = null;
		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback () {
		super.connectedCallback();
	}
	disconnectedCallback () {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return [];
	}
	setProject (id) {
		/**
		 * Project to show
		 * @type {Projects.Project}
		 */
		let project = DATA.get_event_by_id(id);
		this.project = id;
		let name = this.shadowRoot.querySelector('#projectName');
		let desc = this.shadowRoot.querySelector('#projectDesc');
		let progress = this.shadowRoot.querySelector('#projectProgress');
		let progressAmount = this.shadowRoot.querySelector('#AnsProgressCurrent');
		let progressTotal = this.shadowRoot.querySelector('#AnsProgressTotal');
		let meta = this.shadowRoot.querySelector('#projectMeta');
		let selection = this.shadowRoot.querySelector('#depend');
		requestAnimationFrame((e) => {
			name.value = project.name;
			desc.value = project.desc;
			if (project.required > 2) {
				progress.checked = true;
				progressAmount.innerHTML = project.progress;
				progressTotal.innerHTML = project.required;
			} else {
				progress.checked = false;
				progressAmount.innerHTML = '';
				progressTotal.innerHTML = '';
			}
			meta.checked = project.meta;
		});
		selection.clear();
		for (let project_id of project.dependencies) {
			selection.addProject(project_id);
		}
	}


};

Elements.load(Elements.elements.ProjectsProjectEditor, 'elements-projects-project-editor');
};

main();
}
