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
		removeJob (place, value) {
			if (this.jobs[location] > value) {
				return;
			}
			this.jobs[location] = 0;
			this.dispatchUpdate(place);
		}
		makeDisplay () {
			let display = document.createElement('elements-kerbal');
			display.data = this;
			display.updateData();
			this.displays.push(display);
			return display;
		}
		toJSON () {
			let result = Elements.jsonIncludes(this, ['name', 'text', 'jobs']);
			result.type = 'Kerbal';
			return result;
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
};

let KDB = class {
	constructor () {
		this.kerbals = [];
		this.kerbalObjs = new Set();
	}
};

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
