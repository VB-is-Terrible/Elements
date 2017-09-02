'use strict'

Elements.elements.KerbalTag = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.alias = 'KerbalTag';

		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.alias);

		let title = template.querySelector('p.name');
		let subText = template.querySelector('p.subText');

		this.change = {
			name: (value) => {
				title.innerHTML = value;
			},
			subText: (value) => {
				subText.innerHTML = value;
			},
		};

		Elements.setUpAttrPropertyLink(this, 'name', 'Kerbal here', this.change.name);
		Elements.setUpAttrPropertyLink(this, 'text', 'Desc here', this.change.subText);

		shadow.appendChild(template);
	}

	connectedCallback () {
		super.connectedCallback();
	}
	disconnectedCallback () {
	}
	static get observedAttributes () {
		return ['name', 'text'];
	}
}

Elements.load('kerbalTagTemplate.html', Elements.elements.KerbalTag, 'elements-kerbal-tag');
