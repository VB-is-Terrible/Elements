'use strict';

Elements.get('drag-element', 'tab-window', 'kerbal-searcher-kerbal', 'kerbal-searcher-destination', 'kerbal-searcher-group');
{

const main = async () => {
await Elements.get('drag-element');
/**
 * UI to search through kerbals
 * @type {Object}
 * @augments Elements.elements.dragged2
 * @augments Elements.elements.backbone2
 * @property {String} database Name of the database to look up
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallbackKerbal Function to call with the the kerbal whose action was clicked
 * @property {Function} actionCallbackGroup Function to call with the selected group
 */
Elements.elements.KerbalSearcher = class extends Elements.elements.dragged2 {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcher';
		/**
		 * Which database to search
		 * @type {String}
		 * @private
		 */
		this.__database = 'default';

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let kerbalSearcher = template.querySelector('elements-kerbal-searcher-kerbal');
		let destinationSearcher = template.querySelector('elements-kerbal-searcher-destination');
		let groupSearcher = template.querySelector('elements-kerbal-searcher-group');
		this.__searchers = [kerbalSearcher, destinationSearcher, groupSearcher];
		let tabWindow = template.querySelector('elements-tab-window');
		tabWindow.parent = this;
		this.__action = 'Edit';
		this.__actionCallbackKerbal = ((kerbal) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				editor.data = kerbal;
				editor.showWindow();
				requestAnimationFrame((e) => {
					editor.toTop();
				});
			}
		});
		this.__actionCallbackGroup = (group) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				editor.group = group;
				editor.showWindow();
				requestAnimationFrame((e) => {
					editor.toTop();
				});
			}
		};
		shadow.appendChild(template);
		this.applyPriorProperties('database', 'action', 'actionCallbackKerbal', 'actionCallbackGroup');
	}
	get action () {
		return this.__action;
	}
	set action (value) {
		this.__action = value;
		this.__setProps('action', value);
	}
	get actionCallbackKerbal () {
		return this.__actionCallbackKerbal;
	}
	set actionCallbackKerbal (value) {
		this.__actionCallbackKerbal = value;
		let kerbalSearcher = this.shadowRoot.querySelector('elements-kerbal-searcher-kerbal');
		let destinationSearcher = this.shadowRoot.querySelector('elements-kerbal-searcher-destination');
		kerbalSearcher.actionCallback = value;
		destinationSearcher.actionCallback = value;
	}
	get actionCallbackGroup () {
		return this.__actionCallbackGroup;
	}
	set actionCallbackGroup (value) {
		this.__actionCallbackGroup = value;
		let group = this.shadowRoot.querySelector('elements-kerbal-searcher-group');
		group.actionCallback = value;
	}
	get database () {
		return this.__database;
	}
	set database (value) {
		this.__database = value;
		this.__setProps('database', value);
	}

	/**
	 * Set the properties of the searcher children
	 * @param {String} property Property to set
	 * @param {*} value    Value to set property to
	 * @private
	 */
	__setProps (property, value) {
		for (let searcher of this.__searchers) {
			searcher[property] = value;
		}
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

Elements.load('kerbalSearcherTemplate.html', Elements.elements.KerbalSearcher, 'elements-kerbal-searcher');
};

main();
}
