'use strict';

Elements.get('kerbal-group-tag', 'KDB', 'drag-down');
{
const main = async () => {

await Elements.get();
Elements.elements.KerbalEditorGroup = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalEditorGroup';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
}

Elements.load('kerbalEditorGroupTemplate.html', Elements.elements.KerbalEditorGroup, 'elements-kerbal-editor-group');
};

main();
}
