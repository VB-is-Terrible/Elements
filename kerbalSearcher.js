'use strict';

Elements.get('kerbal', 'grid', 'KDB', 'dragDown', 'tabs', 'drag-element');

/**
 * A KerbalDisplay that does nothing. Use this when you don't need all the methods
 * @implements KerbalDisplay
 * @property {KNS.Kerbal} data kerbal that this represents
 * @type {Object}
 */
let BlankKerbalDisplay = class {
	constructor () {
		this.data = null;
	}
	updateData () {

	}
	showJob (place) {

	}
	delete () {

	}
}
/**
 * A KerbalDisplay that only displays jobs
 * re: delete - The consumer of this should deal with this
 * re: updateData - This doesn't build a kerbal tag
 * @implements KerbalDisplay
 * @augments BlankKerbalDisplay
 * @property {KNS.Kerbal} data kerbal that this represents
 * @property {HTMLElement} display display of the kerbal's jobs
 * @type {Object}
 */
let KerbalJobDisplay = class extends BlankKerbalDisplay {
	constructor () {
		super();
		this.__jobDisplay = KNS.blankPlaceList(null);
		this.display = document.createElement('div');
		this.data = null;
	}
	/**
	 * Update the display for a job
	 * @param  {String} place Place to update display
	 */
	showJob (place) {
		requestAnimationFrame(() => {
			let value = this.data.jobs[place];
			if (value > 0) {
				if (this.__jobDisplay[place] === null) {
					// A display element has not been made
					this.__jobDisplay[place] = this.makeJobElement(place, value);
					this.display.appendChild(this.__jobDisplay[place]);
				} else {
					this.changeJobElement(this.__jobDisplay[place], place, value);
					if (!(this.display.contains(this.__jobDisplay[place]))) {
						// A display element has been made, but has since been removed
						this.display.appendChild(this.__jobDisplay[place]);
					}
				}
			} else {
				if (this.display.contains(this.__jobDisplay[place])) {
					this.display.removeChild(this.__jobDisplay[place]);
				}
			}
		});
	}
	/**
	* Make a display element
	* @param  {String} place Location
	* @param  {Number} value Depth of visited required
	* @return {HTMLElement} Element representing place+value
	*/
	makeJobElement (place, value) {
		let p = document.createElement('p');
		p.innerHTML = place + ' ' + KNS.valueToJob(value);
		return p;
	}
	/**
	 * Update a job display element
	 * @param  {HTMLElement} element Job display element
	 * @param  {String} place   Destination of mission
	 * @param  {int} value   Depth of mission
	 */
	changeJobElement (element, place, value) {
		element.innerHTML = place + ' ' + KNS.valueToJob(value);
	}
};

/**
 * Like kerbalJobDisplay, but built for kerbal-search
 * @type {Object}
 * @augments KerbalJobDisplay
 */
let KerbalChoiceDisplay = class extends KerbalJobDisplay {
	/**
	* Make a display element
	* @param  {String} place Location
	* @param  {Number} value Depth of visited required
	* @return {HTMLElement} Element representing place+value
	*/
	makeJobElement (place, value) {
		let div = document.createElement('div');
		div.classList.add('results');
		let p = super.makeJobElement(place, value);
		p.classList.add('job');
		div.appendChild(p);
		let button = document.createElement('button');
		button.value = place;
		button.innerHTML = 'Remove';
		button.classList.add('results');
		button.addEventListener('click', (e) => {
			let event = new CustomEvent('remove', {detail: place, value: place,});
			this.display.dispatchEvent(event);
		});
		div.appendChild(button);
		return div;
	}
	/**
	* Update a job display element
	* @param  {HTMLElement} element Job display element
	* @param  {String} place   Destination of mission
	* @param  {int} value   Depth of mission
	*/
   changeJobElement (element, place, value) {
	   element.querySelector('p').innerHTML = place + ' ' + KNS.valueToJob(value);
   }
};

(async function () {
await Elements.get('KDB', 'kerbal-link', 'drag-element');

let SearchDisplay = class extends BlankKerbalDisplay {
	/**
	 * Build a search display
	 * @param  {KNS.Kerbal} kerbal Kerbal to listen to
	 * @param  {Elements.elements.KerbalSearcher} searcher Searcher to inform
	 */
	constructor (kerbal, searcher) {
		super();
		this.data = kerbal;
		this.searcher = searcher;
		kerbal.addDisplay(this);
	}
	delete () {
		this.searcher.delete_inform(this.data.name);
	}
}

/**
 * UI to search through kerbals
 * @type {Object}
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalSearcher = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcher';
		this.update = null;
		this.maxResults = 5;
		/**
		 * Which database to search
		 * @type {String}
		 */
		this.database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.__lastValue = '';
		this.__lastSearch = 'kerbal';
		this.__virtualDisplayMap = new Map();
		let searcher = template.querySelector('#nameInput');
		let updater = (e) => {
			this.kerbal_search_trigger();
		};
		searcher.addEventListener('keyup', updater);

		for (let checkbox of template.querySelectorAll('input')) {
			checkbox.addEventListener('change', updater);
		}
		let tabs = [
			template.querySelector('#kerbal-search'),
			template.querySelector('#destination-search'),
		];
		let tabChange = (e) => {
			requestAnimationFrame(() => {
				for (let tab of tabs) {
					tab.style.display = 'none';
				}
				let active;
				switch (e.detail) {
					case 'Kerbal':
						active = tabs[0];
						break;
					case 'Destination':
						active = tabs[1];
						break;
					default:
						active = null;
				}
				if (active !== null) {
					active.style.display = 'block'
				}
			});
		}
		// Handle Destination Tab
		/**
		 * KNS.Kerbal already has job tracker
		 * @type {KNS.Kerbal}
		 */
		let virtualKerbal = new KNS.Kerbal();
		let kerbalDisplay = new KerbalChoiceDisplay();
		this.vrtKbl = virtualKerbal;
		this.kblDsp = kerbalDisplay;
		virtualKerbal.addDisplay(kerbalDisplay);
		let destinationSearch = (e) => {
			this.destination_search_trigger();
		};
		let addDestination = (e) => {
			let locationUI = self.shadowRoot.querySelector('#AnsAddPlace');
			let depthUI = self.shadowRoot.querySelector('#AnsAddValue');
			let location = locationUI.value;
			let depth = depthUI.value;
			virtualKerbal.removeJob(location, KNS.MAX_JOB_VALUE);
			virtualKerbal.addJob(location, parseInt(depth));
			locationUI.focus();
			destinationSearch();
		}
		let removeDestination = (e) => {
			let location = e.detail;
			virtualKerbal.removeJob(location, KNS.MAX_JOB_VALUE);
			destinationSearch();
		};
		template.querySelector('#lower').addEventListener('change', destinationSearch);
		template.querySelector('#tourism').addEventListener('change', destinationSearch);

		template.querySelector('#destination-search').appendChild(kerbalDisplay.display);
		template.querySelector('#AnsAddConfirm').addEventListener('click', addDestination);
		kerbalDisplay.display.addEventListener('remove', removeDestination);
		kerbalDisplay.display.id = 'jobs';
		template.querySelector('elements-tabs').addEventListener('change', tabChange);
		let results = template.querySelector('#results');
		results.addEventListener('touchstart', (e) => {
			// Check for overflow
			if (results.clientHeight !== results.scrollHeight) {
				this.parentElement.touch_reset();
				e.stopPropagation();
				e.stopImmediatePropagation();
			}

		});

		template.querySelector('#Close').addEventListener('click', (e) => {
			self.hideWindow();
		});
		shadow.appendChild(template);
	}
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @return {Set}                  Ordered set of results
	 */
	prefix (search, nameList) {
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
	fuzzy (search, nameList) {
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
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @param  {Number} threshold     Edit distance limit
	 * @return {Set}                  Ordered set of results
	 */
	edit (search, nameList, threshold) {
		return [];
	}
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {String[]} nameList    List of names to search through
	 * @return {Set}                  Ordered set of results
	 */
	exact (search, nameList) {
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
		let result = new Set(this.exact(search, nameList));
		if (search === '') {
			return result;
		}
		if (prefix) {
			result = new Set([...result, ...this.prefix(search, nameList)]);
		}
		if (fuzzy) {
			result = new Set([...result, ...this.fuzzy(search, nameList)]);
		}
		if (edit) {
			const threshold = 0;
			result = new Set([...result, ...this.edit(search, nameList, threshold)]);
		}
		return result;
	}
	/**
	 * Show array on screen
	 * @param  {KNS.Kerbal[]} results Array of results, best match to worst
	 */
	display_results (results) {
		let itemHolder = this.shadowRoot.querySelector('#results');
		let count = 1;
		if (this.update !== null) {
			cancelAnimationFrame(this.update);
		}
		let name = this.shadowRoot.querySelector('#resultsTitle');
		let string = 'Results';
		if (results.length !== 0) {
			string += ': ';
			string += results.length.toString();
			string += ' match';
			if (results.length > 1) {
				string += 'es';
			}
		}
		this.update = requestAnimationFrame((e) => {
			this.emptyNodes();

			for (let i = 0; i < results.length; i++) {
				let kerbal = results[i];
				itemHolder.appendChild(this.__makeDisplay(kerbal));
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
		let kdb = KerbalLink.get(this.database);
		let holder = this.shadowRoot.querySelector('#results');
		for (var i = holder.children.length - 1; i >= 0; i--) {
			let kerbal = holder.children[i].children[0];
			if (kerbal.data !== null) {
				kerbal.data.removeDisplay(kerbal);
			}
			holder.removeChild(holder.children[i]);
		}
		for (let kerbal in this.__virtualDisplayMap.keys()) {
			kerbal.removeDisplay(this.__virtualDisplayMap.get(kerbal));
			this.__virtualDisplayMap.delete(kerbal);
		}
	}
	editor (event) {
		let name = event.target.value;
		let search = KerbalLink.getUI(this.database + '-' + 'editor');
		if (search) {
			search.data = KerbalLink.get(this.database).getKerbal(name);
		}
	}
	__makeDisplay (kerbal) {
		let div = document.createElement('div');
		div.classList.add('results');
		let display = kerbal.makeDisplay();
		display.menuvisible = false;
		div.appendChild(display);
		let button = document.createElement('button');
		button.value = kerbal.name;
		button.innerHTML = 'Edit';
		button.classList.add('results');
		button.addEventListener('click', (e) => {
			this.editor(e);
		});
		div.appendChild(button);
		let sDisplay = new SearchDisplay(kerbal, this);
		this.__virtualDisplayMap.set(kerbal, sDisplay);
		return div;
	}
	/**
	 * Search kerbals by destination
	 * @param  {Object} jobList place -> value mapping
	 * @param  {Boolean} lower   Whether to include missions shallower than the search
	 * @param  {Boolean} tourism Whether to only include tourists
	 * @return {KNS.Kerbal[]}    An ordered array of kerbals matching
	 */
	destination_search (jobList, lower, tourism) {
		let locations = [];
		let lower_results = [];
		let results = [];
		for (let location of KNS.places) {
			if (jobList[location] > 0) {
				locations.push({
					place: location,
					value: jobList[location],
				});
			}
		}
		let check = (location, kerbal) => {
			const value = kerbal.jobs[location.place];
			if (value === location.value) {
				return true;
			}
			return false;
		};
		let lower_check = (location, kerbal) => {
			const value = kerbal.jobs[location.place];
			if (lower && value < location.value && value !== 0) {
				return true;
			}
			return false;
		};
		let kdb = KerbalLink.get(this.database);
		for (let kerbalName of kdb.kerbals) {
			let kerbal = kdb.getKerbal(kerbalName);
			if (tourism && kerbal.text !== 'Tourist') {
				break;
			}
			let flag = true;
			let lower_flag = true;
			for (let location of locations) {
				if (!(check(location, kerbal))) {
					flag = false;
				}
				if (!(lower_check(location, kerbal))) {
					lower_flag = false;
					break;
				}
			}
			if (flag === true) {
				results.push(kerbal);
			} else if (lower_flag === true) {
				lower_results.push(kerbal);
			}
		}
		return results.concat(lower_results);
	}
	__resolve_names (array) {
		let kdb = KerbalLink.get(this.database);
		let result = [];
		for (let name of array) {
			result.push(kdb.getKerbal(name));
		}
		return result;
	}
	/**
	 * Start a kerbal search from information in the UI
	 */
	kerbal_search_trigger () {
		let searcher = this.shadowRoot.querySelector('#nameInput');
		let search = searcher.value
		search = KNS.nameSanitizer(search);
		if (search !== this.__lastValue) {
			this.display_results(this.__resolve_names(this.search(search)));
			this.__lastValue = search;
		}
		this.__lastSearch = 'kerbal';
	}
	/**
	 * Start a destination search from information in the UI
	 */
	destination_search_trigger () {
		let virtualKerbal = this.vrtKbl;
		if (virtualKerbal.size === 0) {
			this.display_results([]);
		} else {
			let lower = this.shadowRoot.querySelector('#lower').checked;
			let tourist = this.shadowRoot.querySelector('#tourism').checked;
			let results = this.destination_search(virtualKerbal.jobs, lower, tourist);
			this.display_results(results);
		}
		this.__lastSearch = 'destination';
	}
	/**
	 * Inform the searcher of a kerbal deletion
	 * @param  {String} name Name of kerbal been deleted
	 */
	delete_inform (name) {
		switch (this.__lastSearch) {
			case 'kerbal':
				this.kerbal_search_trigger();
				break;
			case 'destination':
				this.destination_search_trigger();
				break;
			default:
				this.kerbal_search_trigger();
				break;
		}
	}
}

Elements.load('kerbalSearcherTemplate.html', Elements.elements.KerbalSearcher, 'elements-kerbal-searcher');
})();
