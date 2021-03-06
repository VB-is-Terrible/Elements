'use strict';

Elements.get('kerbal-group-tag', 'kerbal-group-display-kerbal', 'dropdown');
{
const main = async () => {

await Elements.get();
/**
 * The standard group display
 * @implements GroupDisplay
 * @property {KNS.Group} data The group to display
 * @property {Boolean} menuvisible Whether to expand group displays
 * @type {Object}
 */
Elements.elements.KerbalGroupDisplay = class extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalGroupDisplay';
		this.__data = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.__tag = template.querySelector('#tag');
		this.__kerbals = template.querySelector('#kerbals');
		let drop_down = template.querySelector('elements-dropdown');
		shadow.appendChild(template);
		this.applyPriorProperties('data');
		Elements.setUpAttrPropertyLink2(this, 'menuvisible', false, (value) => {
			drop_down.menuvisible = value;
		}, Elements.booleaner);
	}
	get data () {
		return this.__data;
	}
	set data (value) {
		this.__tag.data = value;
		this.__kerbals.data = value;
		if (this.__data !== null) {
			this.__data.removeDisplay(this);
		}
		if (this.__data !== null) {
			this.__data.addDisplay(this);
		}
		this.__data = value;
	}
	/**
	 * Add a kerbal to the display
	 * @param {KNS.Kerbal} kerbal Kerbal to display
	 */
	addKerbal (kerbal) {
		this.__tag.addKerbal(kerbal);
		this.__kerbals.addKerbal(kerbal);
	}
	/**
	 * Delete a kerbal's display
	 * @param  {KNS.Kerbal} kerbal Kerbal to remove
	 */
	deleteKerbal (kerbal) {
		this.__tag.deleteKerbal(kerbal);
		this.__kerbals.deleteKerbal(kerbal);
	}
	/**
	 * Update the name, text of the group
	 */
	updateData () {
		this.__tag.updateData(kerbal);
		this.__kerbals.updateData(kerbal);
	}
	static get observedAttributes () {
		return ['menuvisible'];
	}
}

Elements.load(Elements.elements.KerbalGroupDisplay, 'elements-kerbal-group-display');
};

main();
}
