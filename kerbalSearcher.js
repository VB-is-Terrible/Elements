'use strict';

Elements.get('kerbal', 'grid', 'KDB', 'dragDown', 'tabs');

/**
 * A KerbalDisplay that only displays jobs
 * @implements KerbalDisplay
 * @property {KNS.Kerbal} data kerbal that this represents
 * @property {HTMLElement} display display of the kerbal's jobs
 * @type {Object}
 */
let KerbalJobDisplay = class {
	constructor () {
		this.__jobDisplay = KNS.blankPlaceList(null);
		this.display = document.createElement('div');
		this.data = null;
	}
	/**
	 * Update text and name
	 */
	updateData () {
		// This doesn't build a kerbal tag
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
await Elements.get('KDB', 'kerbal-link');

Elements.elements.KerbalSearcher = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcher';
		this.update = null;
		this.maxResults = 5;
		this.database = this.database || 'default';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let lastValue = '';
		let searcher = template.querySelector('#nameInput');
		let updater = (e) => {
			let search = searcher.value
			search = KNS.nameSantizer(search);
			if (search !== lastValue) {
				self.display_results(self.__resolve_names(self.search(search)));
				lastValue = search;
			}
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
			if (virtualKerbal.size === 0) {
				self.display_results([]);
			} else {
				let lower = self.shadowRoot.querySelector('#lower').checked;
				let tourist = self.shadowRoot.querySelector('#tourism').checked;
				let results = self.destination_search(virtualKerbal.jobs, lower, tourist);
				self.display_results(results);
			}
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
	prefix (string, nameList) {
		string = string.toLowerCase();
		let checker = (name) => {
			name = name.toLowerCase();
			if (name.indexOf(string) === 0) {
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
	fuzzy (string, nameList) {
		string = string.toLowerCase();
		let checker = (name) => {
			name = name.toLowerCase();
			let position = 0;
			for (let char of name) {
				if (char === string[position]) {
					position += 1;
				}
			}
			if (position === string.length) {
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
	edit (string) {
		return [];
	}
	exact (string, nameList) {
		if (nameList.includes(string)) {
			return new Set([string]);
		} else {
			return [];
		}
	}
	search (string) {
		let nameList = Array(...KerbalLink.get(this.database).kerbals);
		let prefix = this.shadowRoot.querySelector('#prefix').checked;
		let fuzzy = this.shadowRoot.querySelector('#fuzzy').checked;
		let edit = this.shadowRoot.querySelector('#edit').checked;
		let result = new Set(this.exact(string, nameList));
		if (string === '') {
			return result;
		}
		if (prefix) {
			result = new Set([...result, ...this.prefix(string, nameList)]);
		}
		if (fuzzy) {
			result = new Set([...result, ...this.fuzzy(string, nameList)]);
		}
		if (edit) {
			result = new Set([...result, ...this.edit(string, nameList)]);
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
			this.update = null;
		});
	}
	emptyNodes () {
		let holder = this.shadowRoot.querySelector('#results');
		for (var i = holder.children.length - 1; i >= 0; i--) {
			holder.removeChild(holder.children[i]);
		}
	}
	editor (event) {
		let name = event.target.value;
		document.body.querySelector('elements-kerbal-editor').data = KerbalLink.get(this.database).getKerbal(name);
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
		return div;
	}
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
	hideWindow () {
		this.parentElement.style.display = 'none';
	}
}

Elements.load('kerbalSearcherTemplate.html', Elements.elements.KerbalSearcher, 'elements-kerbal-searcher');
})();
