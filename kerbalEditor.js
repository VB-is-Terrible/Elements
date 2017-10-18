'use strict';

Elements.get('drag-element', 'kerbal-editor-kerbal', 'tab-window');
{
const main = async () => {

await Elements.get('drag-element');
/**
 * Combined UI to make a KNS.Kerbal or KNS.Group
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @property {KNS.Kerbal} data Kerbal been edit - note: this is a copy, not the original
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalEditor = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalEditor';
		this.__database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let kerbalEditor = template.querySelector('elements-kerbal-editor-kerbal');
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
				kerbalEditor.database = value;
			},
		});
		shadow.appendChild(template);
	}
	get data () {
		let kerbalEditor = this.shadowRoot.querySelector('elements-kerbal-editor-kerbal');
		return kerbalEditor.data;
	}
	set data (kerbal) {
		let kerbalEditor = this.shadowRoot.querySelector('elements-kerbal-editor-kerbal');
		kerbalEditor.data = kerbal;
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

Elements.load('kerbalEditorTemplate.html', Elements.elements.KerbalEditor, 'elements-kerbal-editor');
};

main();
}
