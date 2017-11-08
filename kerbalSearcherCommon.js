'use strict';

Elements.get('KDB', 'tab-window');

{
const main = async () => {

await Elements.get('KDB', 'tab-window');

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
	removeGroup (group) {
		this.searcher.delete_inform(group);
	}
	delete () {
		this.database.removeDisplay(this);
	}
};

/**
 * Implements the results showing part of kerbal-searcher-*.
 * Consumers will need to import the relevant display element
 * @type {Object}
 * @augments Elements.elements.tabbed2
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 * @property {Function} makeDisplay Function that takes a result, and returns a display for it. Defaults to displaying kerbals.
 */
Elements.elements.KerbalSearcherCommon = class extends Elements.elements.tabbed2 {
	constructor () {
		super();
		const self = this;

		/**
		 * Raf for display results
		 * @type {Function}
		 * @private
		 */
		this.resultsRAF = Elements.rafContext();

		this.action = 'There should be an action here';
		this.actionCallback = (e) => {
			console.warn('Missing actionCallback');
		};

		/**
		 * Mapping of kerbal -> display element
		 * @type {Map<KNS.Kerbal, HTMLElement>}
		 * @private
		 */
		this.__virtualDisplayMap = new Map();
		/**
		 * The KDBDisplay listener to listen for kerbal deletions
		 * @type {?KDBListener}
		 * @private
		 */
		this.__listener = null;
		/**
		 * Number of results been displayed
		 * @type {Number}
		 */
		this.__results_length = 0;
		this.makeDisplay = (result) => {
			let display = document.createElement('elements-kerbal');
			display.data = result;
			display.menuvisible = false;
			display.deleter = false;
			return display;
		};
		this.applyPriorProperties('makeDisplay');
	}
	/**
	 * Show array on screen, establishes delete/rename watcher
	 * @param  {Array.<Object>} results Array of results, best match to worst
	 */
	display_results (results) {
		let itemHolder = this.shadowRoot.querySelector('#results');
		let name = this.shadowRoot.querySelector('#resultsTitle');
		let string = this.constructor.resultsString(results.length);
		this.emptyNodes();

		let queue = [];
		for (let result of results) {
			let display = this.__makeDisplay(result);
			this.__virtualDisplayMap.set(result, display);
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
	 * @param  {*} result Object representing the search result
	 * @return {HTMLElement}       A div containing the display element & edit button
	 * @private
	 */
	__makeDisplay (result) {
		let div = document.createElement('div');
		div.classList.add('results');
		let display = this.makeDisplay(result);
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
	 * Inform the searcher of a kerbal deletion
	 * @param  {*} result Result been deleted
	 */
	delete_inform (result) {
		if (!this.__virtualDisplayMap.has(result)) {return;}
		let results = this.shadowRoot.querySelector('#resultsTitle');
		let display = this.__virtualDisplayMap.get(result);
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
};

/**
 * Addon to KerbalSearcherCommon to include methods to search
 * @type {Object}
 */
Elements.elements.KerbalSearcherCommonName = class extends Elements.elements.KerbalSearcherCommon {
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
};
Elements.loaded('kerbalSearcherCommon');

}

main();
}
