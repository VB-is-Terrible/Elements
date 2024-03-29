'use strict';

Elements.get('KDB');
{
const main = async () => {

await Elements.get('KDB');

/**
 * A kerbal display that just has the name in text
 * @augments Elements.elements.backbone2
 * @augments BlankKerbalDisplayMixin
 * @property {KNS.Kerbal} data Kerbal to show
 * @implements KerbalDisplay
 * @type {Object}
 */
Elements.elements.KerbalDisplay_text = class extends Elements.common.BlankKerbalDisplayMixin(Elements.elements.backbone2) {
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
			this.__main.textContent = 'Miising Kerbal';
		} else {
			this.__main.textContent = this.data.name;
		}
	}
	delete () {
		requestAnimationFrame((e) => {
			this.remove();
		});
	}
}

Elements.load(Elements.elements.KerbalDisplay_text, 'elements-kerbal-display_text');
};

main();
}
