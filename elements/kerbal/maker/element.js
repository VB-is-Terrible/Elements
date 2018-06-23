'use strict';

Elements.get('drag-element', 'kerbal-maker-kerbal', 'tab-window', 'kerbal-maker-group');
{
const main = async () => {

await Elements.get('drag-element');
/**
 * Combined UI to make a KNS.Kerbal or KNS.Group
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalMaker = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalMaker';
		this.__database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let kerbalMaker = template.querySelector('elements-kerbal-maker-kerbal');
		let groupMaker = template.querySelector('elements-kerbal-maker-group');
		let tabWindow = template.querySelector('elements-tab-window');
		tabWindow.parent = this;
		Object.defineProperty(this, 'database', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__database;
			},
			set: (value) => {
				self.__database = value;
				// Pass the change onto members
				kerbalMaker.database = value;
				groupMaker.database = value;
			},
		});

		this.database = this.__database;
		shadow.appendChild(template);
	}
	showWindow () {
		super.showWindow();
		let tabWindow = this.shadowRoot.querySelector('elements-tab-window');
		tabWindow.showWindowInform();
	}
	hideWindow () {
		super.hideWindow();
		let tabWindow = this.shadowRoot.querySelector('elements-tab-window');
		tabWindow.hideWindowInform();
	}
}

Elements.load(Elements.elements.KerbalMaker, 'elements-kerbal-maker');
};

main();
}
