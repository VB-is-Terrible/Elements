'use strict';

/**
 * A display of a kerbal's name and text
 * @type {Object}
 * @augments Elements.elements.backbone
 * @property {String} name Kerbal's name
 * @property {String} text Kerbal's description
 */
Elements.elements.KerbalTag = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.alias = 'KerbalTag';

		const shadow = this.attachShadow({mode: 'open'});
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

Elements.load(Elements.elements.KerbalTag, 'elements-kerbal-tag');
