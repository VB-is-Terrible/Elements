'use strict';

Elements.require('kerbal');
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
 * Random integer
 * @param  {Number} lower Lower bound
 * @param  {Number} upper Upper bound
 * @return {Number}       lower <= return <= upper
 */
const randint = (lower, upper) => {
	return Math.floor(Math.random() * (upper - lower) + lower);
}
/**
 * Kerbal NameSpace
 * @namespace KNS
 */
let KNS =  {
	/**
	 * Array of names of all the places in KSP
	 * @constant
	 * @type {Array}
	 * @memberof KNS
	 */
	places: ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo', 'Kerbol'],
	/**
	 * Kerbal backend type
	 * Note: if you manually set the data of a elements-kerbal, make sure to
	 * place the elements-kerbal in KNS.Kerbal.displays
	 * @type {Object}
	 * @property {String} name Name of kerbal
	 * @property {String} text Description text of kerbal
	 * @property {Object} jobs PlaceName -> job value mapping
	 * @property {HTMLElement[]} displays Array of UI elements representing this kerbal.
	 * @memberof KNS
	 */
	Kerbal: class {
		constructor () {
			this._name = 'Kerbal';
			this._text = 'Desc';
			this.jobs = KNS.blankPlaceList(0);
			this.displays = [];
			this.type = 'Kerbal';

			this.getters = {
				name: () => {
					return this._name;
				},
				text: () => {
					return this._text;
				},
			};
			this.setters = {
				name: (value) => {
					this._name = value;
					this.dispatchUIUpdate();
				},
				text: (value) => {
					this._text = value;
					this.dispatchUIUpdate();
				},
			};

			for (let name of ['name', 'text']) {
				Object.defineProperty(this, name, {
					enumerable: true,
					configurable: false,
					get: this.getters[name],
					set: this.setters[name],
				});
			}
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
			this.displays.push(display);
			return display;
		}
		/**
		 * Register a display to kerbal
		 * @param {KerbalDisplay} display Display to register
		 * @memberof KNS.Kerbal
		 * @instance
		 */
		addDisplay (display) {
			this.displays.push(display)
			display.data = this;
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
			return Elements.jsonIncludes(this, ['name', 'text', 'jobs', 'type']);
		}
		/**
		 * Construct an kerbal from the object returned from JSON.parse(JSON.stringify(kerbal))
		 * @param  {Object} jsonObj JSON.parse'd kerbal
		 * @return {KNS.Kerbal}     Reconstitued Kerbal
		 * @memberof KNS.Kerbal
		 */
		static fromJSONObj (jsonObj) {
			if (jsonObj.type !== 'Kerbal') {
				throw new Error('Not a kerbal');
			}
			let kerbal = new this();
			Object.assign(kerbal, jsonObj);
			return kerbal;
		}
	},
	blankPlaceList: function (value) {
		let placeList = {};
		for (let place of this.places) {
			placeList[place] = value;
		}
		return placeList;
	},
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
	MAX_JOB_VALUE: 4,
	nameDesantizer: (string) => {
		string = string.replace(/&amp/g, '&');
		string = string.replace(/&lt/g, '<');
		string = string.replace(/&gt/g, '>');
		return string;
	},
	nameSantizer: (string) => {
		string = string.trim();
		string = string.replace(/&/g, '&amp');
		string = string.replace(/</g, '&lt');
		string = string.replace(/>/g, '&gt');
		return string;
	},
};

let KDB = class {
	constructor () {
		this.kerbals = new Set();
		this.kerbalObjs = new Map();
		this.type = 'KDB';
	}
	addKerbal (kerbalObj) {
		if (this.kerbals.has(kerbalObj.name)) {
			throw new Error('KDB already has kerbal');
		}
		this.kerbals.add(kerbalObj.name);
		this.kerbalObjs.set(kerbalObj.name, kerbalObj);
		this.display(kerbalObj);
	}
	getKerbal (name) {
		return this.kerbalObjs.get(name);
	}
	renameKerbal (oldName, newName) {
		let kerbal = this.getKerbal(oldName);
		if (this.kerbals.has(newName)) {
			throw new Error('KDB already has kerbal');
		} else if (kerbal !== null) {
			kerbal.name = newName;
			this.kerbals.delete(oldName);
			this.kerbals.add(newName);
		} else {
			throw new Error('Kerbal not found');
		}
	}
	display (kerbalObj) {
		let newDisplay = kerbalObj.makeDisplay();
		newDisplay.slot = 's' + randint(1,4).toString();
		g.append(newDisplay);
	}
	displayAll () {
		for (let kerbalObj of this.kerbalObjs.values()) {
			this.display(kerbalObj);
		}
	}
	toJSON () {
		// Sets and maps don't stringify well
		let result = Elements.jsonIncludes(this, ['type']);
		result.kerbals = Elements.setToArray(this.kerbals);
		result.kerbalObjs = Elements.setToArray(this.kerbalObjs); // Because we only need the values, this map is close enough to a set
		return result;
	}
	static fromJSONObj (jsonObj) {
		if (jsonObj.type !== 'KDB') {
			throw new Error('Not a KDB');
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
	static fromJSON (json) {
		return this.fromJSONObj(JSON.parse(json))
	}
};

Elements.loaded('KDB');
Elements.loaded('KNS');

const testData = '{"type":"KDB","kerbals":["Ludrey","Lizena","Corald","Seelan","Leebles","Crismy","Gemzor","Katburry","Billy-Boptop","Neca","Richdrin","Matsby","Dema","Traphie","Richbo","Agaene","Nedwin","Caltrey","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Lizena","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Corald","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Seelan","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Leebles","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Crismy","text":"Tourist","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Gemzor","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Katburry","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Billy-Boptop","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Neca","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Richdrin","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Matsby","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Dema","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Traphie","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Richbo","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Agaene","text":"Pilot","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Nedwin","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Caltrey","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Peggy","text":"Engineer","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Tramy","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Phoebe","text":"Pilot","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Gwengee","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Rafred","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Debbart","text":"Pilot","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Valbur","text":"Pilot","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"}]}';

{
	const main = async () => {
		await Elements.get('kerbal-link')
		KerbalLink.load('default');
		KerbalLink.get('default').displayAll();
		test();
	}
	const test = async () => {
		await Elements.get('kerbal-searcher');
		let a = KerbalLink.get('default').getKerbal('Caltrey');
		let b = document.body.querySelector('elements-kerbal-editor');
		b.data = a;
		window.a = a;
		window.b = b;
	}
	main();
}
