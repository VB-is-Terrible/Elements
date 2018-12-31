'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [ProjectsProjectSearcher Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.ProjectsProjectSearcher = class ProjectsProjectSearcher extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'ProjectsProjectSearcher';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
};

Elements.load(Elements.elements.ProjectsProjectSearcher, 'elements-projects-project-searcher');
};

main();
}
