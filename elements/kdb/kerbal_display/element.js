'use strict';

Elements.get('KDB', 'kerbal-display');
{
const main = async () => {

await Elements.get('KDB', 'kerbal-display');

/**
 * @augments Elements.elements.backbone
 * @property {String} database Name of the database to look up
 * @implements KDBDisplay
 * @augments BlankKDBDisplay
 * @type {Object}
 */
Elements.elements.KdbKerbalDisplay = class extends Elements.common.BlankKDBDisplayMixin(Elements.elements.backbone) {
	constructor () {
		super();
		const self = this;
		this.__database = this.database || null;
		Object.defineProperty(this, 'database', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__get_database();
			},
			set: (value) => {
				self.__set_database(value);
			},
		});
		this.name = 'KdbKerbalDisplay';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		shadow.appendChild(template);
		this.database = this.database;
	}
	/**
	 * Fired after addKerbal is called
	 * @param {KNS.Kerbal} kerbal The kerbal been added
	 */
	addKerbal (kerbal) {
		let display = document.createElement('elements-kerbal-display');
		display.data = kerbal;
		let body = this.shadowRoot.querySelector('#pseudoBody');
		display.menuvisible = false;
		requestAnimationFrame((e) => {
			body.appendChild(display);
		});
	}
	renameKerbal (oldName, newName) {}
	deleteKerbal (kerbal) {}
	__get_database () {
		return this.__database;
	}
	/**
	 * Setter for this.database
	 * @param {?String} value New database
	 * @private
	 */
	__set_database (value) {
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
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let displays = [];
		for (let name of kdb.kerbals) {
			let kerbal = kdb.getKerbal(name);
			let display = document.createElement('elements-kerbal-display');
			display.data = kerbal;
			display.menuvisible = false;
			displays.push(display);
		}
		requestAnimationFrame((e) => {
		    for (let display of displays) {
				body.appendChild(display);
			}
		});
	}
	/**
	 * Empty current display
	 * @private
	 */
	emptyNodes () {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		for (let kerbal of body.children) {
			kerbal.data = null;
			requestAnimationFrame((e) => {
				kerbal.remove();
			});
		}
	}
}

Elements.load(Elements.elements.KdbKerbalDisplay, 'elements-kdb-kerbal_display');
};

main();
}
