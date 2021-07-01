'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [MonorailOutput Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.MonorailOutput = class MonorailOutput extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;
		this._speed = 0;
		this._led0 = false;
		this._led1 = false;
		this.name = 'MonorailOutput';
		this.onpb0 = null;
		this.onpb1 = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		template.querySelector('#pb1').addEventListener('click', (e) => {
			let e1 = new Event('PB1');
			self.dispatchEvent(e1);
		});
		template.querySelector('#pb0').addEventListener('click', (e) => {
			let e1 = new Event('PB0');
			self.dispatchEvent(e1);
		});
		//Fancy code goes here
		shadow.appendChild(template);

		this.applyPriorProperties('led0', 'led1', 'onpb0', 'onpb1', 'speed');
	}
	get speed () {
		return this._speed;
	}
	set speed (value) {
		let speed = this.shadowRoot.querySelector('#speed');
		speed.textContent = value;
		this._speed = value;
	}
	get led0 () {
		return this._led0;
	}
	set led0 (value) {
		let led = this.shadowRoot.querySelector('#led0');
		led.textContent = value ? '1' : '0';
		this._led0 = value;
	}
	get led1 () {
		return this._led1;
	}
	set led1 (value) {
		let led = this.shadowRoot.querySelector('#led1');
		led.textContent = value ? '1' : '0';
		this._led1 = value;
	}
};

Elements.load(Elements.elements.MonorailOutput, 'elements-monorail-output');
};

main();
}
