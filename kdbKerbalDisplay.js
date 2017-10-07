'use strict';

Elements.get('KDB');
{
const main = async () => {

await Elements.get('KDB', 'kerbal');

/**
 * @augments Elements.elements.backbone
 * @implements KDBDisplay
 * @type {Object}
 */
Elements.elements.KdbKerbalDisplay = class extends Elements.elements.backbone {
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
	 * @param {String} name Name of kerbal added
	 */
	addKerbal (name) {
		let kerbal = KerbalLink.get(this.database).getKerbal(name);
		let display = kerbal.makeDisplay();
		let body = this.shadowRoot.querySelector('#pseudoBody');
	}
	/**
	 * Fired after a kerbal has been deleted
	 * @param  {String} name Name of deleted kerbal
	 */
	deleteKerbal (name) {}
	/**
	 * Fired after a kerbal has been renamed. Note - not used
	 * @param  {String} oldName Name of kerbal before rename
	 * @param  {String} newName Current name of kerbal
	 */
	renameKerbal (oldName, newName) {}
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
		kdb.addDisplay(this);
		if (kdb === undefined) {return;}
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let displays = []
		for (let name of kdb.kerbals) {
			let kerbal = kdb.getKerbal(name);
			let display = kerbal.makeDisplay();
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
		while (body.childElementCount > 0) {
			let kerbal = body.children[0];
			kerbal.data = null;
			kerbal.remove();
		}
	}
}

Elements.load('kdbKerbalDisplayTemplate.html', Elements.elements.KdbKerbalDisplay, 'elements-kdb-kerbal-display');
};

main();
}
