'use strict';

Elements.get('kerbal', 'KDB', 'tab-window', 'kerbal-link', 'kerbal-searcher-common');
{
const main = async () => {

await Elements.get('tab-window', 'KDB', 'kerbal-searcher-common');

/**
 * Like kerbalJobDisplay, but built for kerbal-search
 * @type {Object}
 * @augments KerbalJobDisplay
 * @implements KerbalDisplay
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
		button.classList.add('remove_place');
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

/**
 * UI to search through kerbals by destination
 * @type {Object}
 * @augments Elements.elements.KerbalSearcherCommon
 * @property {String} database Name of the database to look up
 * @property {String} action   Text to display in buttons next to results
 * @property {Function} actionCallback Function to call with the name of kerbal whose action was clicked
 */
Elements.elements.KerbalSearcherDestination = class extends Elements.elements.KerbalSearcherCommon {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcherDestination';
		/**
		 * Which database to search
		 * @type {String}
		 * @private
		 */
		this.__database = 'default';
		this.action = 'Edit';
		this.actionCallback = ((name) => {
			let editor = KerbalLink.getUI(self.database, 'editor');
			if (editor) {
				let kerbal = KerbalLink.get(self.database).getKerbal(name);
				editor.data = kerbal;
				editor.showWindow();
			}
		});

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		/**
		 * KNS.Kerbal already has job tracker
		 * @type {KNS.Kerbal}
		 */
		let virtualKerbal = new KNS.Kerbal();
		let kerbalDisplay = new KerbalChoiceDisplay();
		this.vrtKbl = virtualKerbal;
		this.kblDsp = kerbalDisplay;
		kerbalDisplay.data = virtualKerbal;
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
		};
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
		this.destination_search_trigger(true);
	}
	/**
	 * Search kerbals by destination
	 * @param  {Object} jobList place -> value mapping
	 * @param  {Boolean} lower   Whether to include missions shallower than the search
	 * @param  {Boolean} tourism Whether to only include tourists
	 * @param  {String[]} [excludes] Name of kerbals to exclude from the search
	 * @return {KNS.Kerbal[]}    An ordered array of kerbals matching
	 */
	destination_search (jobList, lower, tourism, excludes = []) {
		let locations = [];
		let lower_results = [];
		let results = [];
		let reduce = KNS.reducePlaceList(jobList);

		for (let location in reduce) {
			locations.push({
				place: location,
				value: jobList[location],
			});
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
			if (excludes.includes(kerbalName)) {
				continue;
			}
			let kerbal = kdb.getKerbal(kerbalName);
			if (tourism && kerbal.text !== 'Tourist') {
				continue;
			}
			let flag = true;
			let lower_flag = true;
			for (let location of locations) {
				if (!(check(location, kerbal))) {
					flag = false;
				}
				if (!(lower_check(location, kerbal))) {
					lower_flag = false;
					continue;
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
	/**
	 * Start a destination search from information in the UI
	 * @param  {Boolean} [override=false] Flag to force a refresh, even if the current search is already displayed
	 * @param  {String[]} [excludes=[]] List of names to exclude from the search
	 */
	destination_search_trigger (override = false, excludes = []) {
		let virtualKerbal = this.vrtKbl;
		if (virtualKerbal.size === 0) {
			this.display_results([]);
		} else {
			let lower = this.shadowRoot.querySelector('#lower').checked;
			let tourist = this.shadowRoot.querySelector('#tourism').checked;
			let results = this.destination_search(virtualKerbal.jobs, lower, tourist, excludes);
			this.display_results(results);
		}
	}
}

Elements.load('kerbalSearcherDestinationTemplate.html', Elements.elements.KerbalSearcherDestination, 'elements-kerbal-searcher-destination');
};

main();
}
