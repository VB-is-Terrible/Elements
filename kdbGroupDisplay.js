'use strict';

Elements.get('KDB', 'kerbal-group-display');
{
const main = async () => {

await Elements.get('KDB');

/**
 * @augments Elements.elements.backbone2
 * @property {String} database Name of the database to look up
 * @property {Boolean} menuvisible Whether the hide the kerbals in groups
 * @implements KDBDisplay
 * @augments BlankKDBDisplay
 * @type {Object}
 */
Elements.elements.KdbGroupDisplay = class extends BlankKDBDisplayMixin(Elements.elements.backbone2) {
	constructor () {
		super();
		const self = this;
		this.__database = null;
		this.name = 'KdbGroupDisplay';
		this.__displayMap = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		shadow.appendChild(template);
		Elements.setUpAttrPropertyLink2(this, 'menuvisible', false, (value) => {
			for (let display of this.__displayMap.values()) {
				display.menuvisible = value;
			}
		}, Elements.booleaner);
		this.applyPriorProperties('database');
	}
	/**
	 * Called when a group is added
	 * @param {KNS.Group} group The group been added
	 */
	addGroup (group) {
		let display = document.createElement('elements-kerbal-group-display');
		display.data = group;
		let body = this.shadowRoot.querySelector('#pseudoBody');
		display.menuvisible = this.menuvisible;
		this.__displayMap.set(group, display);
		requestAnimationFrame((e) => {
			body.appendChild(display);
		});
	}
	/**
	 * Called when a group is deleted
	 * @param  {KNS.Group} group The deleted group
	 */
	removeGroup (group) {
		let display = this.__displayMap.get(group);
		display.data = null;
		requestAnimationFrame((e) => {
			display.remove();
		});
	}
	get database () {
		return this.__database;
	}
	/**
	 * Setter for this.database
	 * @param {?String} value New database
	 * @private
	 */
	set database (value) {
		this.emptyNodes();
		if (this.database !== null) {
			let old = KerbalLink.get(this.database);
			old.removeDisplay(this);

		}
		this.__database = value;
		if (value === null) {return;}
		const kdb = KerbalLink.get(this.database);
		if (kdb === undefined) {return;}
		kdb.addDisplay(this);
		for (let group of kdb.groups.values()) {
			this.addGroup(group);
		}
	}
	/**
	 * Empty current display
	 * @private
	 */
	emptyNodes () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		for (let group of body.children) {
			this.__displayMap.delete(group.data);
			group.data = null;
			requestAnimationFrame((e) => {
				group.remove();
			});
		}
	}
	static get observedAttributes () {
		return ['menuvisible'];
	}
}

Elements.load('kdbGroupDisplayTemplate.html', Elements.elements.KdbGroupDisplay, 'elements-kdb-group-display');
};

main();
}
