'use strict';

Elements.elements.KerbalFooter = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalFooter';
		this.database = this.database || 'default';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let save = template.querySelector('#save');
		let port = template.querySelector('#port');
		let menu = template.querySelector('#window');

		let saver = (e) => {
			KerbalLink.save(this.database);
		};
		save.addEventListener('click', saver);

		let porter = (e) => {

		};

		shadow.appendChild(template);
	}
}

Elements.load('kerbalFooterTemplate.html', Elements.elements.KerbalFooter, 'elements-kerbal-footer');
