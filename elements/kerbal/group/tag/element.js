'use strict';

Elements.get('KDB');
{
const main = async () => {

await Elements.get('KDB');
/**
 * A group display that just shows the name and text
 * @implements GroupDisplay
 * @property {KNS.Group} data The group been displayed
 * @augments Elements.elements.backbone2
 * @augments GroupDisplay
 * @implements GroupDisplay
 * @type {Object}
 */
Elements.elements.KerbalGroupTag = class extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalGroupTag';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		shadow.appendChild(template);
		this.__data = null;
		this.applyPriorProperties('data');
		if (this.__data !== null) {
			let name = this.shadowRoot.querySelector('p.name');
			let text = this.shadowRoot.querySelector('p.subText');
			name.textContent = this.data.name;
			text.textContent = this.data.text;
		}
	}
	get data () {
		return this.__data;
	}
	set data (value) {
		if (this.__data !== null) {
			this.data.removeDisplay(this);
		}
		this.__data = value;
		if (this.__data !== null) {
			this.data.addDisplay(this);
			this.updateData();
		}
	}
	/**
	 * Add a kerbal to the display
	 * @param {KNS.Kerbal} kerbal Kerbal to display
	 */
	addKerbal (kerbal) {}
	/**
	 * Delete a kerbal's display
	 * @param  {KNS.Kerbal} kerbal Kerbal to remove
	 */
	deleteKerbal (kerbal) {}
	/**
	 * Update the name, text of the group
	 */
	updateData () {
		let name = this.shadowRoot.querySelector('p.name');
		let text = this.shadowRoot.querySelector('p.subText');
		requestAnimationFrame((e) => {
			name.textContent = this.data.name;
			text.textContent = this.data.text;
		});
	}
}

Elements.load(Elements.elements.KerbalGroupTag, 'elements-kerbal-group-tag');
};

main();
}
