'use strict'

Elements.elements.$1 = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = '$1';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
}

Elements.load('$0Template.html', Elements.elements.$1, 'elements-$2');
