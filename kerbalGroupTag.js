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
 * @augments BlankGroupDisplay
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

			this.updateData();
		}
	}
	addKerbal (kerbal) {}
	deleteKerbal (kerbal) {}
	updateData () {
		let name = this.shadowRoot.querySelector('p.name');
		let text = this.shadowRoot.querySelector('p.subText');
		requestAnimationFrame((e) => {
		    name.innerHTML = Elements.nameSanitizer(this.data.name);
			text.innerHTML = Elements.nameSanitizer(this.data.text);
		});
	}
}

Elements.load('kerbalGroupTagTemplate.html', Elements.elements.KerbalGroupTag, 'elements-kerbal-group-tag');
};

main();
}
