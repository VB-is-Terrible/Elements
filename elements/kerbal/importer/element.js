'use strict';
Elements.get('drag-element', 'kerbal-importer-import', 'kerbal-importer-export');

{
const main = async () => {
await Elements.get('drag-element');

/**
 * Element that has a import/export window
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalImporter = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;
		this.name = 'KerbalImporter';
		this.__database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let importer = template.querySelector('elements-kerbal-importer-import');
		let exporter = template.querySelector('elements-kerbal-importer-export');
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
				importer.database = value;
				exporter.database = value;
			},
		});

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

Elements.load(Elements.elements.KerbalImporter, 'elements-kerbal-importer');
}
main();
}
