'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [FakebookPost Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.FakebookPost = class FakebookPost extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'FakebookPost';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

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
};

Elements.load(Elements.elements.FakebookPost, 'elements-fakebook-post');
};

main();
}
