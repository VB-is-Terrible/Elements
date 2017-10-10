'use strict';

Elements.get('kerbal');
/**
 * Interface for display of a Kerbal
 * @interface KerbalDisplay
 */
/**
 * @property {KNS.Kerbal} data
 * @description The kerbal to display
 * @name KerbalDisplay.data
 */
/**
 * @function updateData
 * @description Fired when kerbal.data or kerbal.text changes
 * @name KerbalDisplay.updateData
 */
/**
 *
 * @function showJob
 * @description Fired whenever a depth changes
 * @name KerbalDisplay.showJob
 * @param {String} place place where the mission depth has changed
 *
 */
/**
 * @function delete
 * @description Fired when the kerbal is deleted
 * @name KerbalDisplay.delete
*/
/**
 * Interface for a display of a KDB.
 * If you want updates for kerbals, you'll need to subscribe to the kerbal indivually
 * @interface KDBDisplay
 */
/**
 * @function addKerbal
 * @param {String} name Name of the added kerbal
 * @description Fired after a kerbal is added
 * @name KDBDisplay.addKerbal
 */
/**
 * @function deleteKerbal
 * @param {String} name Name of the deleted kerbal
 * @description Fired after a kerbal is deleted
 * @name KDBDisplay.deleteKerbal
 */
/**
 * @function renameKerbal
 * @param {String} oldName Old name of the renamed kerbal
 * @param {String} newName New name of the renamed kerbal
 * @description Fired after a kerbal is renamed
 * @name KDBDisplay.renameKerbal
 */
/**
 * @function addGroup
 * @param {Number} groupID Id of the added group
 * @description Fired after a group is added
 * @name KDBDisplay.addGroup
 */
/**
 * @function removeGroup
 * @param {Number} groupID Id of removed group
 * @description Fired after a group is removed
 * @name KDBDisplay.removeGroup
*/
/**
 * @property {String} database Name of the kdb to display
 * @description The KDB to display
 * @name KDBDisplay.database
*/
/**
 * Interface for a Group of Kerbals
 * If you want updates for kerbals, you'll need to subscribe to the kerbal indivually
 * @interface GroupDisplay
 */
/**
 * @function addKerbal
 * @param {KNS.Kerbal} name Kerbal that was added
 * @description Fired after a kerbal is added
 * @name GroupDisplay.addKerbal
 */
/**
 * @function deleteKerbal
 * @param {KNS.Kerbal} name Name of the added kerbal
 * @description Fired after a kerbal is added
 * @name GroupDisplay.deleteKerbal
 */
/**
 * @function updateData
 * @description Fired when Group.data or Group.text changes
 * @name GroupDisplay.updateData
 */
/**
 * @property {KNS.Group} data
 * @description The Grout to display
 * @name GroupDisplay.data
 */


/**
 * Random integer
 * @param  {Number} lower Lower bound
 * @param  {Number} upper Upper bound
 * @return {Number}       lower <= return <= upper
 */
const randint = (lower, upper) => {
	return Math.floor(Math.random() * (upper - lower) + lower);
}

/**
 * @typedef {Object.<String, Number>} JobList
 */

/**
 * Kerbal NameSpace
 * @namespace KNS
 */
let KNS =  {
	/**
	 * Array of names of all the places in KSP
	 * @constant
	 * @type {String[]}
	 * @memberof KNS
	 */
	places: ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo', 'Kerbol'],
	/**
	 * Remove any places that have a value of 0
	 * @param  {JobList} jobList A jobList
	 * @return {JobList}         A reduced jobList
	 */
	reducePlaceList: function (jobList) {
		let placeList = {};
		for (let place of this.places) {
			if (jobList[place] > 0) {
				placeList[place] = jobList[place];
			}
		}
		return placeList;
	},
	/**
	 * Kerbal backend type
	 * @type {Object}
	 * @property {String} name Name of kerbal
	 * @property {String} text Description text of kerbal
	 * @property {JobList} jobs PlaceName -> job value mapping
	 * @property {KerbalDisplay[]} displays Array of UI elements representing this kerbal.
	 * @memberof KNS
	 */
	Kerbal: class {
		constructor () {
			this._name = 'Kerbal';
			this._text = 'Desc';
			this.jobs = KNS.blankPlaceList(0);
			this.displays = [];
			this.type = 'Kerbal';
		}
		get name () {
			return this._name;
		}
		set name (value) {
			this._name = value;
			this.dispatchUIUpdate();
		}
		get text () {
			return this._text;
		}
		set text (value) {
			this._text = value;
			this.dispatchUIUpdate();
		}
		/**
		 * Update UIs for one place
		 * @param  {String} place Place name
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		dispatchUpdate (place) {
			for (let display of this.displays) {
				display.showJob(place);
			}

		}
		/**
		 * Updates name and place of UIs
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		dispatchUIUpdate () {
			for (let display of this.displays) {
				display.updateData();
			}
		}
		/**
		 * Add a job to kerbal
		 * @param {String} place Location to visit
		 * @param {Number} value Depth of visit
		 * @memberof KNS.Kerbal
		 * @instance
 	 	 */
		addJob (place, value) {
			if (this.jobs[place] >= value) {
				return;
			}
			this.jobs[place] = value;
			this.dispatchUpdate(place);
		}
		/**
		 * Remove a job, as if the kerbal has just completed one
		 * @param  {String} location Location visited
		 * @param  {Number} value    Depth of visited
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		removeJob (location, value) {
			if (this.jobs[location] > value) {
				return;
			}
			this.jobs[location] = 0;
			this.dispatchUpdate(location);
		}
		/**
		 * Make a elements-kerbal representing this kerbal
		 * @return {Elements.elements.Kerbal} elements-kerbal representing this kerbal
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		makeDisplay () {
			let display = document.createElement('elements-kerbal');
			display.data = this;
			return display;
		}
		/**
		 * Register a display to kerbal
		 * @param {KerbalDisplay} display Display to register
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		addDisplay (display) {
			if (this.displays.includes(display)) {
				return;
			}
			this.displays.push(display)
		}
		/**
		 * Deregister a display to kerbal
		 * @param  {KerbalDisplay} display [description]
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		removeDisplay (display) {
			let index = this.displays.indexOf(display);
			if (index < 0) {return;}
			this.displays.splice(index, 1);
		}
		/**
		 * Number of destinations to visit
		 * @return {Number} Number of locations to visit
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		get size () {
			let size = 0;
			for (let location of KNS.places) {
				if (this.jobs[location] !== 0) {
					size += 1;
				}
			}
			return size;
		}
		toJSON () {
			let result =  Elements.jsonIncludes(this, ['name', 'text', 'type']);
			result.jobs = KNS.reducePlaceList(this.jobs);
			return result;
		}
		/**
		 * Delete this kerbal
		 * @memberof KNS.Kerbal
		 */
		delete () {
			for (let display of this.displays) {
				display.delete();
			}
		}
		/**
		 * Construct an kerbal from the object returned from JSON.parse(JSON.stringify(kerbal))
		 * @param  {Object} jsonObj JSON.parse'd kerbal
		 * @return {KNS.Kerbal}     Reconstitued Kerbal
		 * @memberof KNS.Kerbal
		 */
		static fromJSONObj (jsonObj) {
			if (jsonObj.type !== 'Kerbal') {
				throw new KNS.KDBParseError('Not a kerbal');
			}
			let kerbal = new this();
			let jobs = jsonObj.jobs;
			delete jsonObj.jobs;
			Object.assign(kerbal, jsonObj);
			for (let location in jobs) {
				kerbal.jobs[location] = jobs[location];
			}

			return kerbal;
		}
		/**
		 * Equality check for KDBs
		 * @param  {KNS.Kerbal} kerbal1 First kerbal to compare
		 * @param  {KNS.Kerbal} kerbal2 Second kerbal to compare
		 * @return {Boolean}   If the two kerbals are equalivalent
		 * @memberof KNS.Kerbal
		 */
		static equals (kerbal1, kerbal2) {
			if (kerbal1.name !== kerbal2.name) {
				return false;
			}
			if (kerbal1.text !== kerbal2.text) {
				return false;
			}
			for (let place of KNS.places) {
				if (kerbal1.jobs[place] !== kerbal2.jobs[place]) {
					return false;
				}
			}
			return true;
		}
	},
	/**
	 * Returns a object with the mapping [place] -> value for all places
	 * @param  {*} value Default value
	 * @return {JobList}  Mapping of [place] -> value
	 * @memberof KNS
	 */
	blankPlaceList: function (value) {
		let placeList = {};
		for (let place of this.places) {
			placeList[place] = value;
		}
		return placeList;
	},
	/**
	 * Converts a UI input to job value
	 * @param  {String} value Text representing job
	 * @return {Number}       Value of job
	 * @memberof KNS
	 */
	valueToJob: function (value) {
		switch (value) {
			case 0:
				return '';
				break;
			case 1:
				return 'Flyby';
				break;
			case 2:
				return 'Sub-Orbital';
				break;
			case 3:
				return 'Orbit';
				break;
			case 4:
				return 'Landing'
				break;
			default:
				return '????';
		}
	},
	/**
	 * Converts a job value to text
	 * @param  {Number} job Job value
	 * @return {String}     Text representing job
	 * @memberof KNS
	*/
	jobToValue: function (job) {
		switch (job) {
			case '':
				return 0;
				break;
			case 'Flyby':
				return 1;
				break;
			case 'Sub-Orbital':
				return 2;
				break;
			case 'Orbit':
				return 3;
				break;
			case 'Landing':
				return 4;
				break;
			default:
				return 0;
		}
	},
	/**
	 * Highest depth for a job
	 * @const {Number}
	 * @memberof KNS
	 */
	MAX_JOB_VALUE: 4,
	/**
	 * Desanitizes a string for HTML.
	 * Used for UI output where escaping is not required, i.e. not HTML.
	 * e.g. placeholder value set via js
	 * @param  {String} string Sanitized string
	 * @return {String}        Unsafe string
	 * @memberof KNS
	 */
	nameDesanitizer: (string) => {
		string = string.replace(/&amp/g, '&');
		string = string.replace(/&lt/g, '<');
		string = string.replace(/&gt/g, '>');
		return string;
	},
	/**
	 * Sanitizes a string for HTML.
	 * @param  {String} string Unsafe string
	 * @return {String}        Sanitized string
	 * @memberof KNS
	 */
	nameSanitizer: (string) => {
		string = string.trim();
		string = string.replace(/&/g, '&amp');
		string = string.replace(/</g, '&lt');
		string = string.replace(/>/g, '&gt');
		return string;
	},
	KDBParseError: class extends Error {
		constructor (...args) {
			super(...args);
			Error.captureStackTrace(this, this.constructor);
		}
	},
	/**
	 * A Group of kerbals
	 * @param  {Number} id Unique id to identify group by
	 * @property {String} name Name of Group
	 * @property {String} text Description text of group
	 * @property {Number} id (Readonly) Unique id to identify group by
	 * @property {KNS.Kerbal[]} kerbals Kerbals in group. Note - don't modify directly
	 * @type {Object}
	 */
	Group: class {
		constructor (id) {
			this.kerbals = [];
			this.__id = id;
			/**
			 * Set of registered displays
			 * @type {Set<GroupDisplay>}
			 * @private
			 */
			this.__displays = new Set();
			this.__name = 'Group';
			this.__text = 'Desc';
			this.type = 'Group';
		}
		get name () {
			return this.__name;
		}
		set name (value) {
			this.__name;
			this.updateData();
		}
		get text () {
			return this.__text;
		}
		set text (value) {
			this.__text = value;
			this.updateData();
		}
		get id () {
			return this.__id;
		}
		/**
		 * Add a kerbal to this group
		 * @param {KNS.Kerbal} kerbal Kerbal to add
		 * @memberof KNS.Group
		 */
		addKerbal (kerbal) {
			if (this.kerbals.includes(kerbal)) {
				return;
			}
			this.kerbals.push(kerbal);
			for (let display of this.__displays) {
				display.addKerbal(kerbal);
			}
		}
		/**
		 * Remove a kerbal from this group.
		 * Note - currently assuming that the KDB will inform us of a kerbal
		 * deletion, and that we don't have to listen for it
		 * @param  {KNS.Kerbal} kerbal Kerbal to remove
		 * @memberof KNS.Group
		 */
		removeKerbal (kerbal) {
			let index = this.kerbals.indexOf(kerbal);
			if (index !== -1) {
				this.kerbals.splice(index, 1);
			} else {
				return;
			}
			for (let display of this.__displays) {
				display.removeKerbal(kerbal);
			}
		}
		/**
		 * Find kerbal by name
		 * @param  {String} name Kerbal name
		 * @return {?KNS.Kerbal} Kerbal if found, null if not
		 */
		getKerbal (name) {
			for (let kerbal of this.kerbals) {
				if (kerbal.name === name) {
					return kerbal;
				}
			}
			return null;
		}
		/**
		 * Call remove place on all member kerbals
		 * @param  {String} location Location visited
		 * @param  {Number} value    Depth of visited
		 * @memberof KNS.Group
		 */
		removePlace (location ,value) {
			for (let kerbal of this.kerbals) {
				kerbal.removeJob(location, value);
			}
		}
		/**
		 * Register a display to recieve callbacks on state changes
		 * @param {GroupDisplay} display Display to register
		 * @memberof KNS.Group
		 */
		addDisplay (display) {
			this.__displays.add(display);
		}
		/**
		 * Deregister a display
		 * @param  {GroupDisplay} display Display to deregister
		 * @memberof KNS.Group
		 */
		removeDisplay (display) {
			this.__displays.delete(display);
		}
		/**
		 * Trigger the updateData callback of registered listeners
		 * @private
		 * @memberof KNS.Group
		 */
		dispatchUpdate () {
			for (let display of this.__displays) {
				display.updateData();
			}
		}
		toJSON () {
			let result = Elements.jsonIncludes(this, ['type', 'name', 'text']);
			let nameList = [];
			for (let kerbal of this.kerbals) {
				nameList.push(kerbal.name);
			}
			result.kerbals = nameList;
			return result;
		}
		/**
		 * Construct an group from the object returned from JSON.parse(JSON.stringify(group))
		 * @param  {Object} jsonObj JSON.parse'd group
		 * @param  {KDB} db         KDB to get kerbals from (Group stores names, not JS objects)
		 * @return {KNS.Group}      Revived Group
		 * @memberof KNS.Group
		 */
		static fromJSONObj (jsonObj, db) {
			if (jsonObj.type !== 'Group') {
				throw new KNS.KDBParseError('Not a group');
			}
			let group = new this(db.groupCounter);
			let nameList = jsonObj.kerbals;
			delete jsonObj.kerbals;
			Object.assign(group, jsonObj);
			for (let name of nameList) {
				group.addKerbal(db.getKerbal(name));
			}
			return group;
		}
		/**
		 * Equality check for groups
		 * @param  {Group} group1 First group to compare
		 * @param  {Group} group2 Second group to compare
		 * @return {Boolean}      If the two kerbals are equalivalent
		 */
		static equals (group1, group2) {
			if (group1.name !== group2.name) {
				return false;
			}
			if (kerbal1.text !== kerbal2.text) {
				return false;
			}
			return true;
		}
	},
};

/**
 * Kerbal database - used to store information on kerbals.
 * @property {Set<String>} kerbals Set of all kerbals in the db
 * @property {Number} groupCounter Auto-incrementing counter for unique ids
 */
const KDB = class KDB {
	constructor () {
		this.kerbals = new Set();
		this.__groupCounter = 0;
		/**
		 * Mapping of groups
		 * @type {Map<Number, KNS.Group>}
		 */
		this.groups = new Map();
		/**
		 * Mapping of kerbal names to their objects
		 * @type {Map<String, KNS.Kerbal>}
		 * @private
		 */
		this.kerbalObjs = new Map();
		this.type = 'KDB';
		/**
		 * Set of displays to callback on changes
		 * @type {Set<KDBDisplay>}
		 * @private
		 */
		this.__displays = new Set();
	}
	/**
	 * Add a new kerbal
	 * @param {KNS.Kerbal} kerbalObj Kerbal to add
	 * @throws {Error} If kerbal already exists
	 */
	addKerbal (kerbalObj) {
		if (this.kerbals.has(kerbalObj.name)) {
			throw new Error('KDB already has kerbal');
		}
		this.kerbals.add(kerbalObj.name);
		this.kerbalObjs.set(kerbalObj.name, kerbalObj);
		for (let display of this.__displays) {
			display.addKerbal(kerbalObj.name);
		}
	}
	/**
	 * Get a kerbal by name
	 * @param  {String} name Name of kerbal to get
	 * @return {?KNS.Kerbal} Kerbal
	 */
	getKerbal (name) {
		let result = this.kerbalObjs.get(name);
		if (result === undefined) {
			result = null;
		}
		return result;
	}
	/**
	 * Rename a kerbal, cleanly
	 * @param  {String} oldName Current name of kerbal
	 * @param  {String} newName New name for kerbal
	 * @throws {Error} If newName is already taken
	 * @throws {Error} If no kerbal has oldName
	 */
	renameKerbal (oldName, newName) {
		let kerbal = this.getKerbal(oldName);
		if (this.kerbals.has(newName)) {
			throw new Error('KDB already has kerbal');
		} else if (kerbal !== null) {
			kerbal.name = newName;
			this.kerbals.delete(oldName);
			this.kerbals.add(newName);
			this.kerbalObjs.delete(oldName);
			this.kerbalObjs.set(newName, kerbal);
		} else {
			throw new Error('Kerbal not found');
		}
		for (let display of this.__displays) {
			display.renameKerbal(oldName, newName);
		}
	}
	/**
	 * Delete a kerbal
	 * @param  {String} name Name of kerbal to delete
	 * @throws {Error} If kerbal does not exist
	 */
	deleteKerbal (name) {
		let kerbal = this.getKerbal(name);
		if (kerbal === null) {
			throw new Error('Kerbal not found');
		}
		kerbal.delete();
		this.kerbals.delete(name);
		this.kerbalObjs.delete(name);
		for (let display of this.__displays) {
			display.deleteKerbal(name);
		}
	}
	/**
	 * Convert self to json
	 * @return {Object} Object to pass to JSON.stringify
	 */
	toJSON () {
		// Sets and maps don't stringify well
		let result = Elements.jsonIncludes(this, ['type']);
		result.kerbals = Elements.setToArray(this.kerbals);
		result.kerbalObjs = Elements.setToArray(this.kerbalObjs); // Because we only need the values, this map is close enough to a set
		return result;
	}
	/**
	 * Revive a kdb from json
	 * @param  {Object} jsonObj Object from JSON.parse
	 * @return {KDB}         Revived kdb
	 */
	static fromJSONObj (jsonObj) {
		if (jsonObj.type !== 'KDB') {
			throw new KNS.KDBParseError('Not a KDB');
		}
		let kdb = new this();
		kdb.kerbals = new Set(jsonObj.kerbals);
		for (let kerbalObj of jsonObj.kerbalObjs) {
			let kerbal = KNS.Kerbal.fromJSONObj(kerbalObj);
			kdb.kerbalObjs.set(kerbal.name, kerbal);
		}

		console.assert(kdb.kerbals.size === kdb.kerbalObjs.size);
		for (let name of kdb.kerbals) {
			console.assert(kdb.kerbalObjs.has(name));
		}
		return kdb;
	}
	/**
	 * Revive a kdb from JSON
	 * @param  {String} json String from JSON.stringify(kdb)
	 * @return {KDB}         Revived kdb
	 */
	static fromJSON (json) {
		return this.fromJSONObj(JSON.parse(json))
	}
	/**
	 * Equality check for KDBs
	 * @param  {KDB} thing1 First kdb to compare
	 * @param  {KDB} thing2 Second kdb to compare
	 * @return {Boolean}   If this and other are equalivalent
	 */
	static equals (thing1, thing2) {
		for (let name of thing1.kerbals) {
			if (!thing2.kerbals.has(name)) {
				return false;
			}
		}
		for (let name of thing2.kerbals) {
			if (!thing1.kerbals.has(name)) {
				return false;
			}
		}
		for (let name of thing1.kerbals) {
			let ours = thing1.getKerbal(name);
			let theirs = thing2.getKerbal(name);
			if (!KNS.Kerbal.equals(ours, theirs)) {
				return false;
			}
		}
		return true;
	}
	/**
	 * Register a display to recieve callbacks on state changes
	 * @param {KDBDisplay} display Display to register
	 */
	addDisplay (display) {
		this.__displays.add(display);
	}
	/**
	 * Deregister a display
	 * @param  {KDBDisplay} display Display to deregister
	 */
	removeDisplay (display) {
		this.__displays.delete(display);
	}
	/**
	 * Add a new group
	 * @param {KNS.Group} group Group to add
	 * @throws {Error} If group already exists
	 */
	addGroup (group) {
		let id = group.id;
		if (this.groups.has(id)) {
			throw new Error('KDB already has group');
		}
		this.groups.set(id, group);
		for (let display of this.__displays) {
			display.addGroup(name);
		}
	}
	/**
	 * Get a group by id
	 * @param  {Number} groupID  Id of group to get
	 * @return {?KNS.Group}      Group with matching id
	 */
	getGroup (groupID) {
		let result = this.groups.get(groupID);
		if (result === undefined) {
			result = null;
		}
		return result;
	}
	/**
	 * Remove a group
	 * @param  {Number} groupID Id of group to remove
	 * @throws {Error} If group does not exist
	 */
	removeGroup (groupID) {
		if (!this.groups.has(groupID)) {
			throw new Error('Group not found');
		}
		this.groups.delete(groupID);
		for (let display of this.__displays) {
			display.removeGroup(name);
		}
	}
	get groupCounter () {
		let result = this.__groupCounter;
		this.groupCounter += 1;
		return result;
	}
};

/**
 * A KerbalDisplay that does nothing. Use this when you don't need all the methods
 * @implements KerbalDisplay
 * @property {KNS.Kerbal} data kerbal that this represents
 * @type {Object}
 */
const BlankKerbalDisplay = class {
	constructor () {
		this.data = null;
	}
	/**
	 * Callback for when kerbal.data or kerbal.text changes
	 */
	updateData () {

	}
	/**
	 * Callback for when kerbal.data or kerbal.text changes
	 * @param  {String} place Place that had its value change
	 */
	showJob (place) {

	}
	/**
	 * Fired when the kerbal is deleted
	 */
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
const KerbalJobDisplay = class extends BlankKerbalDisplay {
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
 * A KDBDisplay that does nothing. Use this to implement methods you don't need.
 * Note: For now, it's a good idea to inherit from this, as new methods WILL be added to KDBDisplay
 * @implements KDBDisplay
 * @property {KDBDisplay} data KDB that this represents
 * @type {Object}
 */
const BlankKDBDisplay = class {
	constructor () {
		this.database = this.database || null;
	}
	/**
	 * Fired after addKerbal is called
	 * @param {String} name Name of kerbal added
	 */
	addKerbal (name) {

	}
	/**
	 * Fired after a kerbal has been deleted
	 * @param  {String} name Name of deleted kerbal
	 */
	deleteKerbal (name) {

	}
	/**
	 * Fired after a kerbal has been renamed
	 * @param  {String} oldName Name of kerbal before rename
	 * @param  {String} newName Current name of kerbal
	 */
	renameKerbal (oldName, newName) {

	}
	/**
	 * Fired after a group is added
	 * @param {Number} groupID Id of the added group
	 */
	addGroup (groupID) {

	}
	/**
	 * Fired after a group is removed
	 * @param {Number} groupID Id of removed group
	 */
	removeGroup (groupID) {

	}
}


/**
* A KDBDisplay mixin that does nothing. Use this to implement methods you don't need.
* Note: For now, it's a good idea to use this if you can't inherit BlankKDBDisplay,
* as new methods WILL be added to KDBDisplay.
* See BlankKDBDisplay for documentation
* @param {Object} superclass Class to mix KDBDisplay methods into
* @return {KDBDisplay} Class that implements KDBDisplay
*/
const BlankKDBDisplayMixin = (superclass) => {
	return class mixin extends superclass {
		constructor (...args) {
			super(...args);
			this.database = this.database || null;
		}
		addKerbal (name) {}
		deleteKerbal (name) {}
		renameKerbal (oldName, newName) {}
		addGroup (groupID) {}
		removeGroup (groupID) {}
	}
}

Elements.loaded('KDB');
Elements.loaded('KNS');

const testData = '{"type":"KDB","kerbals":["Ludrey","Lizena","Corald","Seelan","Leebles","Crismy","Gemzor","Katburry","Billy-Boptop","Neca","Richdrin","Matsby","Dema","Traphie","Richbo","Agaene","Nedwin","Caltrey","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Lizena","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Corald","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Seelan","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Leebles","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Crismy","text":"Tourist","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Gemzor","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Katburry","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Billy-Boptop","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Neca","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Richdrin","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Matsby","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Dema","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Traphie","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Richbo","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Agaene","text":"Pilot","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Nedwin","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Caltrey","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Peggy","text":"Engineer","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Tramy","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Phoebe","text":"Pilot","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Gwengee","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Rafred","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Debbart","text":"Pilot","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Valbur","text":"Pilot","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"}]}';

const testData2 = '{"type":"KDB","kerbals":["Ludrey","Lizena","Corald","Seelan","Leebles","Crismy","Gemzor","Katburry","Billy-Boptop","Neca","Richdrin","Matsby","Dema","Traphie","Richbo","Agaene","Nedwin","Caltrey","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Lizena","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4,"Kerbol":3}},{"name":"Corald","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Seelan","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Leebles","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Crismy","text":"Tourist","type":"Kerbal","jobs":{"Mun":3}},{"name":"Gemzor","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Katburry","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Billy-Boptop","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Neca","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Richdrin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Kerbol":3}},{"name":"Matsby","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Dema","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Traphie","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Richbo","text":"Scientist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Agaene","text":"Pilot","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Nedwin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4}},{"name":"Caltrey","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Peggy","text":"Engineer","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Tramy","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Phoebe","text":"Pilot","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Gwengee","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Rafred","text":"Engineer","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Debbart","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Valbur","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}}]}';

const testData3 = '{"type":"KDB","kerbals":["Ludrey","Lizena","Seelan","Leebles","Gemzor","Katburry","Billy-Boptop","Matsby","Dema","Traphie","Agaene","Nedwin","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Lizena","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4,"Kerbol":3}},{"name":"Seelan","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Leebles","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Gemzor","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Katburry","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Billy-Boptop","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Matsby","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Dema","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Traphie","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Agaene","text":"Pilot","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Nedwin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4}},{"name":"Peggy","text":"Engineer","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Tramy","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Phoebe","text":"Pilot","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Gwengee","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Rafred","text":"Engineer","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Debbart","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Valbur","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}}]}';
