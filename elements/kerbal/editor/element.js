'use strict';

Elements.get('drag-element', 'kerbal-editor-kerbal', 'tab-window', 'kerbal-editor-group');
{
const main = async () => {

await Elements.get('drag-element');
/**
 * Combined UI to make a KNS.Kerbal or KNS.Group
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @property {KNS.Kerbal} data Kerbal been edit - note: this is a copy, not the original
 * @property {KNS.Group} group Group been edited - note: this is a copy, not the original
 * @augments Elements.elements.dragged2
 */
Elements.elements.KerbalEditor = class extends Elements.elements.dragged2 {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalEditor';
		this.__database = 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let tabWindow = template.querySelector('elements-tab-window');
		tabWindow.parent = this;
		/**
		 * Internal reference to tabWindow
		 * @type {Elements.elements.tabWindow}
		 * @private
		 */
		this.__tabWindow = tabWindow;
		shadow.appendChild(template);
		this.applyPriorProperties('database', 'data', 'group');
	}
	get database () {
		return this.__database;
	}
	set database (value) {
		let kerbalEditor = this.shadowRoot.querySelector('elements-kerbal-editor-kerbal');
		let groupEditor = this.shadowRoot.querySelector('elements-kerbal-editor-group');
		this.__database = value;
		kerbalEditor.database = value;
		groupEditor.database = value;
	}
	get data () {
		let kerbalEditor = this.shadowRoot.querySelector('elements-kerbal-editor-kerbal');
		return kerbalEditor.data;
	}
	set data (kerbal) {
		let kerbalEditor = this.shadowRoot.querySelector('elements-kerbal-editor-kerbal');
		kerbalEditor.data = kerbal;
		this.__tabWindow.selected = 'Kerbal';
	}
	get group () {
		let groupEditor = this.shadowRoot.querySelector('elements-kerbal-editor-group');
		return groupEditor.group;
	}
	set group (group) {
		let groupEditor = this.shadowRoot.querySelector('elements-kerbal-editor-group');
		groupEditor.group = group;
		this.__tabWindow.selected = 'Group';
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

Elements.load(Elements.elements.KerbalEditor, 'elements-kerbal-editor');
};

main();
}
