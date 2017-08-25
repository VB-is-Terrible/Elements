'use strict'

Elements.elements.KerbalEditor = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.name = 'KerbalEditor';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
}

Elements.load('kerbalEditorTemplate.html', Elements.elements.KerbalEditor, 'elements-kerbal-editor');
