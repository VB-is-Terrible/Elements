'use strict';

Elements.get('kerbal-display', 'KDB', 'dropdown', 'Kerbal_link', 'kerbal-searcher-Common');
{
const main = async () => {

await Elements.get('tab-window', 'KDB', 'kerbal-searcher-Common', 'drag-Common');

/**
 * UI to search through kerbals by name
 * @type {Object}
 * @augments Elements.elements.KerbalSearcherCommon
 * @augments Elements.elements.backbone2
 * @property {String} database Name of the database to look up
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 */
Elements.elements.KerbalSearcherKerbal = class extends Elements.elements.KerbalSearcherCommonName {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcherKerbal';
		/**
		 * Which database to search
		 * @type {String}
		 * @private
		 */
		this.__database = 'default';
		this.action = 'Edit';
		this.actionCallback = ((kerbal) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				editor.data = kerbal;
				editor.showWindow();
				requestAnimationFrame((e) => {
					editor.toTop();
				});
			}
		});

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.__lastValue = '';

		let searcher = template.querySelector('#nameInput');
		searcher.addEventListener('keyup', (e) => {
			self.kerbal_search_trigger();
		});

		let updater = (e) => {
			self.kerbal_search_trigger(true);
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
		Elements.common.stop_drag_events(template);
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
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @return {Set}                  Ordered set of results
	 */
	static prefix (search, nameList) {
		search = search.toLowerCase();
		let checker = (name) => {
			name = name.toLowerCase();
			if (name.indexOf(search) === 0) {
				return true;
			}
			return false;
		}
		let results = new Set();
		for (let name of nameList) {
			if (checker(name)) {
				results.add(name);
			}
		}
		return results;
	}
	/**
	 * Match names to the search, matching by fuzzy search
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @return {Set}                  Ordered set of results
	 */
	static fuzzy (search, nameList) {
		search = search.toLowerCase();
		let checker = (name) => {
			name = name.toLowerCase();
			let position = 0;
			for (let char of name) {
				if (char === search[position]) {
					position += 1;
				}
			}
			if (position === search.length) {
				return true;
			} else {
				return false;
			}
		}
		let results = new Set();
		for (let name of nameList) {
			if (checker(name)) {
				results.add(name);
			}
		}
		return results;
	}
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @param  {Number} threshold     Edit distance limit
	 * @return {Set}                  Ordered set of results
	 */
	static edit (search, nameList, threshold) {
		let result = new Set();
		for (let name of nameList) {
			let distance = this.editDistance(name, search);
			if (distance < threshold) {
				result.add(name);
			}
		}
		return result;
	}
	/**
	 * Find the edit distance between two strings
	 * @param  {String} string1 First string to compare
	 * @param  {String} string2 Second string to compare
	 * @return {Number}         The edit distance between the two strings
	 * @private
	 */
	static editDistance (string1, string2) {
		const m = string1.length + 1;
		const n = string2.length + 1;
		const fill = (length) => {
			let result = [];
			for (let i = 0; i < length; i++) {
				result.push(0);
			}
			return result;
		}
		let d = [];
		for (let i = 0; i < n; i++) {
			d.push(fill(m));
		}
		for (let i = 0; i < m; i++) {
			d[0][i] = i;
		}
		for (let i = 0; i < n; i++) {
			d[i][0] = i;
		}
		for (let y = 1; y < n; y++) {
			for (let x = 1; x < m; x++) {
				if (string1[x-1] === string2[y-1]) {
					d[y][x] = d[y-1][x-1];
				} else {
					d[y][x] = Math.min(d[y-1][x] + 1, d[y][x-1] + 1, d[y-1][x-1] + 1);
			}
		}
		}
		return d[n-1][m-1];
	}
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @return {Set}                  Ordered set of results
	 */
	static exact (search, nameList) {
		if (nameList.includes(search)) {
			return new Set([search]);
		} else {
			return [];
		}
	}
	/**
	 * Search for a kerbal, deriving options from the UI
	 * @param  {String} search        Name to search for
	 * @param  {Array}  [excludes=[]] List of names to exclude
	 * @return {Set}               Set of matches, in order of likeness
	 */
	search (search, excludes = []) {
		let nameList = Array(...KerbalLink.get(this.database).kerbals);
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
			return result;
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
		return result;
	}
	/**
	 * Start a kerbal search from information in the UI
	 * @param  {Boolean} [override=false] Flag to force a refresh, even if the current search is already displayed
	 * @param  {String[]} [excludes=[]] List of names to exclude from the search
	 */
	kerbal_search_trigger (override = false, excludes = []) {
		let searcher = this.shadowRoot.querySelector('#nameInput');
		let search = searcher.value;
		search = Elements.nameSanitizer(search);
		if (search !== this.__lastValue || override) {
			this.display_results(this.__resolve_names(this.search(search, excludes)));
			this.__lastValue = search;
		}
	}
	/**
	 * Resovle an array of kerbal names into kerbals
	 * @param  {String[]} array List of names
	 * @return {KNS.Kerbal[]}   List of kerbals with those names
	 * @private
	 */
	__resolve_names (array) {
		let kdb = KerbalLink.get(this.database);
		let result = [];
		for (let name of array) {
			result.push(kdb.getKerbal(name));
		}
		return result;
	}
}

Elements.load(Elements.elements.KerbalSearcherKerbal, 'elements-kerbal-searcher-kerbal');
};

main();
}
