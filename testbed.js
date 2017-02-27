let testElement1 = class extends HTMLElement {
	constructor () {
		super();
		let shadow = this.createShadowRoot();
		let template = document.importNode(
					document.querySelector('#template1'),
					true);

		shadow.appendChild(template.content)
	}
	connectedCallback () {
		console.log('connected');
	}
	attributeChangedCallback(attrValue, oldValue, newValue) {
		console.log(attrValue, oldValue, newValue);
	}
}


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
}

window.customElements.define('test-element2', testElement2);
