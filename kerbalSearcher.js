'use strict';

Elements.get('drag-element', 'tab-window', 'elements-kerbal-searcher-kerbal', 'elements-kerbal-searcher-destination');
{

const main = async () => {
await Elements.get('drag-element');
/**
 * UI to search through kerbals
 * @type {Object}
 * @augments Elements.elements.dragged
 * @property {String} database Name of the database to look up
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 */
Elements.elements.KerbalSearcher = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcher';
		/**
		 * Which database to search
		 * @type {String}
		 * @private
		 */
		this.__database = this.database || 'default';

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let kerbalSearcher = template.querySelector('elements-kerbal-searcher-kerbal');
		let destinationSeacher = template.querySelector('elements-kerbal-searcher-destination');
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
				kerbalSearcher.database = value;
				destinationSeacher.database = value;
			},
		});
		this.__action = this.action || 'Edit';
		Object.defineProperty(this, 'action', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__action;
			},
			set: (value) => {
				self.__action = value;
				// Pass the change onto members
				kerbalSearcher.action = value;
				destinationSeacher.action = value;
			},
		});
		this.__actionCallback = this.actionCallback || ((name) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				let kerbal = KerbalLink.get(self.database).getKerbal(name);
				editor.data = kerbal;
				editor.showWindow();
			}
		});
		Object.defineProperty(this, 'actionCallback', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__actionCallback;
			},
			set: (value) => {
				self.__actionCallback = value;
				// Pass the change onto members
				kerbalSearcher.actionCallback = value;
				destinationSeacher.actionCallback = value;
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

Elements.load('kerbalSearcherTemplate.html', Elements.elements.KerbalSearcher, 'elements-kerbal-searcher');
};

main();
}
