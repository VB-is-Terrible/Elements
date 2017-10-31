'use strict'

Elements.get('kerbal', 'KDB', 'tab-window');

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
	delete () {
		this.database.removeDisplay(this);
	}
}

/**
 * Implements the results showing part of kerbal-searcher-*
 *
 * @type {Object}
 * @augments Elements.elements.tabbed2
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 */
Elements.elements.KerbalSearcherCommon = class extends Elements.elements.tabbed2 {
	constructor () {
		super();
		const self = this;

		/**
		 * Raf for display results
		 * @type {Function<Function>}
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
		let display = document.createElement('elements-kerbal');
		display.data = kerbal;
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
Elements.loaded('kerbalSearcherCommon');

}

main();
}
