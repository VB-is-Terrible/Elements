'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
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

		let name = this.shadowRoot.querySelector('#projectName');
		let desc = this.shadowRoot.querySelector('#projectDesc');
		let progress = this.shadowRoot.querySelector('#projectProgress');
		let progressAmount = this.shadowRoot.querySelector('#AnsProgressCurrent');
		let progressTotal = this.shadowRoot.querySelector('#AnsProgressTotal');
		let meta = this.shadowRoot.querySelector('#projectMeta');
		let depend = this.shadowRoot.querySelector('#depend');
		name.value = '';
		desc.value = '';
		progress.checked = false;
		progressAmount.value = null;
		meta.checked = false;
		depend.clear();

	}

};

Elements.load(Elements.elements.ProjectsProjectEditor, 'elements-projects-project-editor');
};

main();
}
