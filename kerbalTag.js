'use strict'

Elements.elements.KerbalTag = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.name = 'KerbalTag';

		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		this.ro = new ResizeObserver((entries) => {
			this.updateDisplay(entries);
		});

		let title = template.querySelector('p.name');
		let subText = template.querySelector('p.subText');

		this.change = {
			name: (value) => {
				title.innerHTML = value;
			},
			subText: (value) => {
				subText.innerHTML = value;
			},
		}

		Elements.setUpAttrPropertyLink(this, 'name', 'Kerbal here', this.change.name);
		Elements.setUpAttrPropertyLink(this, 'text', 'Desc here', this.change.subText);

		shadow.appendChild(template);
	}

	connectedCallback () {
		super.connectedCallback();
		this.ro.observe(this.shadowRoot.querySelector('#pseudoBody'))
	}
	disconnectedCallback () {
		this.ro.disconnect();
	}
	static get observedAttributes () {
		return ['name', 'text'];
	}
	updateDisplay (e) {
		let cr = e[0].contentRect;
		let width = cr.width;
		let height = cr.height;
		let img = this.shadowRoot.querySelector('img');
		let textBox = this.shadowRoot.querySelector('.textBox');
		textBox.style.width = (width - img.width).toString() + 'px';
	}
}

Elements.load('kerbalTagTemplate.html', Elements.elements.KerbalTag, 'elements-kerbal-tag');
