'use strict';

Elements.get('KDB');
{
const main = async () => {

await Elements.get('KDB');

/**
 * A kerbal display that just has the name in text
 * @augments Elements.elements.backbone
 * @augments BlankKerbalDisplayMixin
 * @implements KerbalDisplay
 * @type {Object}
 */
Elements.elements.KerbalDisplayText = class extends BlankKerbalDisplayMixin(Elements.elements.backbone2) {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalDisplayText';
		this.__data = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.__main = template.querySelector('#main');
		this.applyPriorProperty('data', null);
		shadow.appendChild(template);
	}
	connectedCallback () {
		super.connectedCallback();
		this.updateDisplay();
	}
	get data () {
		return this.__data;
	}
	set data (value) {
		if (this.__data !== null) {
			this.__data.removeDisplay(this);
		}
		this.__data = value;
		this.updateDisplay();
		if (value !== null) {
			value.addDisplay(this);
		}
	}
	updateDisplay () {
		if (this.data === null) {
			this.__main.innerHTML = 'Miising Kerbal';
		} else {
			this.__main.innerHTML = Elements.nameSanitizer(this.data.name);
		}
	}
	delete () {
		requestAnimationFrame((e) => {
			this.remove();
		});
	}
}

Elements.load(Elements.elements.KerbalDisplayText, 'elements-kerbal-display-text');
};

main();
}
