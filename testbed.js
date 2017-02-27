let testElement1 = class extends Elements.elements.backbone {
	constructor () {
		super();


		let shadow = this.createShadowRoot();
		let template = document.importNode(
					document.querySelector('#template1'),
					true);

		Elements.setUpAttrPropertyLink(this, 'test', 'bye world');
		shadow.appendChild(template.content)
	}
	connectedCallback () {
		super.connectedCallback();
		console.log('test');
	}
	static get observedAttributes () {
		return ['test'];
	}
};


window.customElements.define('test-element1', testElement1);

let testElement2 = class extends HTMLElement {
	constructor () {
		super();
		let shadow = this.createShadowRoot();
		let template = document.importNode(
					document.querySelector('#template2'),
					true);

		shadow.appendChild(template.content)
	}
};

window.customElements.define('test-element2', testElement2);
