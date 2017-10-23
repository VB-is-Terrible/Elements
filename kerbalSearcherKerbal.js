'use strict';

Elements.get('kerbal', 'KDB', 'drag-down', 'tab-window', 'kerbal-link');
{
const main = async () => {

await Elements.get('tab-window', 'KDB');

/**
 * A KerbalDisplay used to listen to delete and rename callbacks
 * @type {Object}
 * @augments BlankKDBDisplay
 * @implements KDBDisplay
 */
let KDBListener = class extends BlankKDBDisplay {
	/**
	 * Build a listener
	 * @param  {KDB} database database to listen
	 * @param  {Elements.elements.KerbalSearcher} searcher Searcher to inform
	 */
	constructor (database, searcher) {
		super();
		this.searcher = searcher;
		this.database = database;
		database.addDisplay(this);
	}
	deleteKerbal (kerbal) {
		this.searcher.delete_inform(kerbal);
	}
	renameKerbal (oldName, newName) {
		this.searcher.rename_inform(oldName, newName);
	}
	delete () {
		this.database.removeDisplay(this);
	}
}

/**
 * UI to search through kerbals by name
 * @type {Object}
 * @augments Elements.elements.tabbed
 * @property {String} database Name of the database to look up
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 */
Elements.elements.KerbalSearcherKerbal = class extends Elements.elements.tabbed {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcherKerbal';
		this.resultsRAF = Elements.rafContext();
		/**
		 * Which database to search
		 * @type {String}
		 * @private
		 */
		this.__database = this.database || 'default';
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
		this.action = this.action || 'Edit';
		this.actionCallback = this.actionCallback || ((name) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				let kerbal = KerbalLink.get(self.database).getKerbal(name);
				editor.data = kerbal;
				editor.showWindow();
			}
		});

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.__lastValue = '';
		this.__virtualDisplayMap = new Map();
		this.__listener = null;
		this.__results_length = 0;

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
				this.parentElement.touch_reset();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}

		});

		shadow.appendChild(template);
	}
	/**
	 * Getter for database
	 * @private
	 * @return {String} Name of database
	 */
	__get_database () {
		return this.__database;
	}
	/**
	 * Setter for database
	 * @param {String} value Name of database to search
	 * @private
	 */
	__set_database (value) {
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
		let search = searcher.value
		search = Elements.nameSanitizer(search);
		if (search !== this.__lastValue || override) {
			this.display_results(this.__resolve_names(this.search(search, excludes)));
			this.__lastValue = search;
		}
	}
	/**
	 * Show array on screen, establishes delete/rename watcher
	 * @param  {KNS.Kerbal[]} results Array of results, best match to worst
	 */
	display_results (results) {
		let itemHolder = this.shadowRoot.querySelector('#results');
		let name = this.shadowRoot.querySelector('#resultsTitle');
		let string = this.constructor.resultsString(results.length);
		this.emptyNodes();

		let queue = [];
		for (let kerbal of results) {
			let display = this.__makeDisplay(kerbal);
			this.__virtualDisplayMap.set(kerbal, display);
			queue.push(display);
		}
		this.__results_length = results.length;

		let database = KerbalLink.get(this.database);
		this.__listener = new KDBListener(database, this);

		this.resultsRAF((e) => {

			for (let display of queue) {
				itemHolder.appendChild(display);
			}
			name.innerHTML = string;
			if (results.length === 0) {
				itemHolder.style.display = 'none';
			} else {
				itemHolder.style.display = 'block';
			}
			this.update = null;
		});
	}
	/**
	 * Resets the results display
	 */
	emptyNodes () {
		// TODO: raf' this function
		let kdb = KerbalLink.get(this.database);
		let holder = this.shadowRoot.querySelector('#results');
		for (var i = holder.children.length - 1; i >= 0; i--) {
			let kerbal = holder.children[i].children[0];
			if (kerbal.data !== null) {
				kerbal.data = null;
				this.__virtualDisplayMap.delete(kerbal.data);
			} else {
				console.warn('Could not find a kerbal in its holder');
			}
			holder.removeChild(holder.children[i]);
		}
		if (this.__virtualDisplayMap.size > 0) {
			this.__virtualDisplayMap = new Map();
		}
	}
	/**
	 * Causes the selected kerbal to be sent to the editor
	 * @private
	 * @param  {KNS.Kerbal} kerbal Kerbal been clicked
	 */
	editor (kerbal) {
		let name = kerbal.name;
		this.actionCallback(name);
	}
	/**
	 * Make a new div displaying a search result
	 * @param  {KNS.Kerbal} kerbal Kerbal to show
	 * @return {HTMLElement}       A div containing the kerbal, edit button
	 * @private
	 */
	__makeDisplay (kerbal) {
		let div = document.createElement('div');
		div.classList.add('results');
		let display = kerbal.makeDisplay();
		display.menuvisible = false;
		display.deleter = false;
		div.appendChild(display);
		let button = document.createElement('button');
		button.innerHTML = this.action;
		button.classList.add('results');
		button.addEventListener('click', (e) => {
			this.editor(kerbal);
		});
		div.appendChild(button);
		return div;
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
	/**
	 * Inform the searcher of a kerbal deletion
	 * @param  {KNS.Kerbal} kerbal Kerbal been deleted
	 */
	delete_inform (kerbal) {
		if (!this.__virtualDisplayMap.has(kerbal)) {return;}
		let results = this.shadowRoot.querySelector('#resultsTitle');
		let display = this.__virtualDisplayMap.get(kerbal);
		this.__results_length -= 1;
		let string = this.constructor.resultsString(this.__results_length);
		requestAnimationFrame((e) => {
		    display.remove();
			results.innerHTML = string;
		});
	}
	/**
	 * Inform the searcher of a kerbal rename
	 * @param  {String} oldName Previous name of kerbal
	 * @param  {String} newName New name of kerbal
	 */
	rename_inform (oldName, newName) {}
	/**
	 * Generates the string to display in #Results
	 * @param  {Number} amount Number of results
	 * @return {String}        String if "Results: n matches"
	 */
	static resultsString (amount) {
		let string = 'Results';
		if (amount !== 0) {
			string += ': ';
			string += amount.toString();
			string += ' match';
			if (amount > 1) {
				string += 'es';
			}
		}
		return string;
	}
}

Elements.load('kerbalSearcherKerbalTemplate.html', Elements.elements.KerbalSearcherKerbal, 'elements-kerbal-searcher-kerbal');
};

main();
}
