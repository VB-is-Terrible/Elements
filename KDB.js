Elements.require('kerbal');

window.KNS =  {
	places: ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo', 'Kerbol'],
	/**
	 * Kerbal backend type
	 * @type {[type]}
	 */
	Kerbal: class {
		constructor () {
			this._name = 'Kerbal';
			this._text = "Desc";
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
		dispatchUpdate (place) {
			for (let display of this.displays) {
				display.showJob(place);
			}
		}
		dispatchUIUpdate () {
			for (let display of this.displays) {
				display.updateData();
			}
		}
		/**
		 * Add a job to kerbal
		 * @param {String} place Location to visit
		 * @param {Number} value Depth of visit
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
		 */
		removeJob (location, value) {
			if (this.jobs[location] > value) {
				return;
			}
			this.jobs[location] = 0;
			this.dispatchUpdate(location);
		}
		makeDisplay () {
			let display = document.createElement('elements-kerbal');
			display.data = this;
			display.updateData();
			this.displays.push(display);
			return display;
		}
		toJSON () {
			return Elements.jsonIncludes(this, ['name', 'text', 'jobs', 'type']);
		}
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
};

let KDB = class {
	constructor () {
		this.kerbals = new Set();
		this.kerbalObjs = new Map();
		this.type = "KDB";
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
	display (kerbalObj) {
		let newDisplay = kerbalObj.makeDisplay();
		newDisplay.slot = "s1";
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

let testData = '{"type":"KDB","kerbals":["Jeb","Bob"],"kerbalObjs":[{"name":"Jeb","text":"Pilot","jobs":{"Kerbin":1,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Bob","text":"Engineer","jobs":{"Kerbin":0,"Mun":4,"Minmus":3,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":1},"type":"Kerbal"}]}';

Elements.await(() => {
	let kdb = KDB.fromJSON(testData);
	kdb.displayAll();
}, 'kerbal');
Elements.loaded('KDB');

function test () {
	window.kdb = new KDB();
	let a = new KNS.Kerbal();
	a.name = "Jeb";
	a.text = "Pilot";
	a.addJob('Minmus', KNS.jobToValue('Flyby'));
	a.addJob('Mun', KNS.jobToValue('Landing'));
	let display = a.makeDisplay();
	display.setAttribute('slot', 's1');
	g.append(display);
	kdb.kerbals.push(a);
}
