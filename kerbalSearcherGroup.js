'use strict';

Elements.get('elements-kerbal-group-display', 'KDB', 'drag-down', 'kerbal-link', 'kerbal-searcher-common');
{
const main = async () => {

await Elements.get('kerbal-searcher-common');
/**
 * UI to search through kerbals by name
 * @type {Object}
 * @augments Elements.elements.KerbalSearcherCommon
 * @augments Elements.elements.KerbalSearcherCommonNAme
 * @augments Elements.elements.backbone2
 * @property {String} database Name of the database to look up
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 */
Elements.elements.KerbalSearcherGroup = class extends Elements.elements.KerbalSearcherCommonName {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcherGroup';
		this.__database = 'default';
		this.action = 'Edit';
		this.actionCallback = ((group) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				//TODO: implement
				console.warn('NotImplementedError');
				editor.data = kerbal;
				editor.showWindow();
			}
		});
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		this.__lastValue = '';
		let searcher = template.querySelector('#nameInput');
		searcher.addEventListener('keyup', (e) => {
			self.search_trigger();
		});

		let updater = (e) => {
			self.search_trigger(true);
		}
		let checkboxes = template.querySelector('#checkboxes');
		for (let checkbox of checkboxes.querySelectorAll('input')) {
			checkbox.addEventListener('change', updater);
		}

		let results = template.querySelector('#results');
		results.addEventListener('touchstart', (e) => {
			// Check for overflow
			if (results.clientHeight !== results.scrollHeight) {
				this.touch_reset();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}

		});
		for (let input of template.querySelectorAll('input')) {
			if (input.type === 'text') {
				input.addEventListener('mousedown', (e) => {
					e.stopPropagation();
				});
			}
		}
		this.makeDisplay = (result) => {
			let display = document.createElement('elements-kerbal-group-display');
			display.data = result;
			display.menuvisible = false;
			return display;
		}
		shadow.appendChild(template);
		this.applyPriorProperties('database', 'action', 'actionCallback');
	}
	/**
	 * Getter for database
	 * @private
	 * @return {String} Name of database
	 */
	get database () {
		return this.__database;
	}
	/**
	 * Setter for database
	 * @param {String} value Name of database to search
	 * @private
	 */
	set database (value) {
		this.emptyNodes();
		this.__database = value;
		this.kerbal_search_trigger(true);
	}
	/**
	 * Search for a kerbal, deriving options from the UI
	 * @param  {String} search        Name to search for
	 * @param  {Array}  [excludes=[]] List of names to exclude
	 * @return {KNS.Group[]}               Array of matches, in order of likeness
	 */
	search (search, excludes = []) {
		let nameList = [];
		let nameToGroup = new Map();
		for (let group of KerbalLink.get(this.database).groups.values()) {
			if (nameToGroup.has(group.name)) {
				nameToGroup.get(group.name).push(group);
			} else {
				nameList.push(group.name);
				nameToGroup.set(group.name, [group]);
			}
		}
		for (let name of excludes) {
			let index = nameList.indexOf(name);
			if (index !== -1) {
				nameList.splice(index, 1);
			}
		}
		let prefix = this.shadowRoot.querySelector('#prefix').checked;
		let fuzzy = this.shadowRoot.querySelector('#fuzzy').checked;
		let edit = this.shadowRoot.querySelector('#edit').checked;
		let result = new Set(this.constructor.exact(search, nameList));
		if (search === '') {
			return [];
		}
		if (prefix) {
			result = new Set([...result, ...this.constructor.prefix(search, nameList)]);
		}
		if (fuzzy) {
			result = new Set([...result, ...this.constructor.fuzzy(search, nameList)]);
		}
		if (edit) {
			const threshold = 2;
			result = new Set([...result, ...this.constructor.edit(search, nameList, threshold)]);
		}
		let trueResult = [];
		for (let name of result) {
			for (let group of nameToGroup.get(name)) {
				trueResult.push(group);
			}
		}
		return trueResult;
	}
	/**
	 * Start a kerbal search from information in the UI
	 * @param  {Boolean} [override=false] Flag to force a refresh, even if the current search is already displayed
	 * @param  {String[]} [excludes=[]] List of names to exclude from the search
	 */
	search_trigger (override = false, excludes = []) {
		let searcher = this.shadowRoot.querySelector('#nameInput');
		let search = searcher.value;
		search = Elements.nameSanitizer(search);
		if (search !== this.__lastValue || override) {
			let results = this.search(search, excludes);
			this.display_results(results);
			this.__lastValue = search;
		}
	}
};

Elements.load('kerbalSearcherGroupTemplate.html', Elements.elements.KerbalSearcherGroup, 'elements-kerbal-searcher-group');
}

main();
}
