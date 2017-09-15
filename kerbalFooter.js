'use strict';

Elements.elements.KerbalFooter = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalFooter';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
}

Elements.load('kerbalFooterTemplate.html', Elements.elements.KerbalFooter, 'elements-kerbal-footer');
