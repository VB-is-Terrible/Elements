'use strict'

Elements.require('drag-down');

// Move this to config later
const KerbalPlaces = ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo', 'Kerbol'];
Elements.elements.Kerbal = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.name = 'Kerbal';
		this.jobs = this.constructor.blankPlaceList(0);
		this.jobDisplay = this.constructor.blankPlaceList(null);
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let dragDown = template.querySelector('elements-drag-down');
		this.change = {
			name: (value) => {
				dragDown.name = value;
			},
			subText: (value) => {
				dragDown.text = value;
			},
		};

		Elements.setUpAttrPropertyLink(this, 'name', 'Kerbal here', this.change.name);
		Elements.setUpAttrPropertyLink(this, 'text', 'Desc here', this.change.subText);

		shadow.appendChild(template);
	}

	connectedCallback () {
		super.connectedCallback();
		this.loadJob();
		this.displayJobs();
	}
	disconnectedCallback () {
		this.emptyNodes();
		// To avoid conflicts when reconnecting, empty all child nodes
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
		this.showJob(place);
	}
	/**
	 * Load jobs from children
	 */
	loadJob () {
		let split = (s) => {
			s = s.trim();
			let location = s.indexOf(' ');
			return [s.substring(0, location), s.substring(location + 1)];
		};
		let children = this.children;
		for (let child of children) {
			let [location, type] = split(child.innerHTML);
			if (location in this.jobs) {
				let value = this.constructor.jobToValue(type);
				if (this.jobs[location] < value) {
					this.jobs[location] = value;
				}
			}
		}
	}
	/**
	 * Displays held jobs
	 */
	displayJobs () {
		this.emptyNodes();
		for (let location of KerbalPlaces) {
			this.showJob(location);
		}
	}
	/**
	 * Update the display for a job
	 * @param  {String} location Location to update display
	 */
	showJob (location) {
		requestAnimationFrame(() => {
			let value = this.jobs[location];
			if (this.jobs[location] > 0) {
				if (this.jobDisplay[location] === null) {
					// A display element has not been made
					this.jobDisplay[location] = this.constructor.makeJobElement(location, value);
					this.appendChild(this.jobDisplay[location]);
				} else {
					this.jobDisplay[location].innerHTML = location + ' ' + this.constructor.valueToJob(value);
					if (!(this.contains(this.jobDisplay[location]))) {
						// A display element has been made, but has since been removed
						this.appendChild(this.jobDisplay[location]);
					}
				}
			} else {
				if (this.contains(this.jobDisplay[location])) {
					this.removeChild(this.jobDisplay[location]);
				}
			}
		});
	}
	/**
	 * Remove all children
	 */
	emptyNodes () {
		for (var i = this.children.length - 1; i >= 0; i--) {
			this.removeChild(this.children[i]);
		}
	}
	/**
	 * Remove a job, as if the kerbal has just completed one
	 * @param  {String} location Location visited
	 * @param  {Number} value    Depth of visited
	 */
	removeJob(location, value) {
		if (this.jobs[location] > value) {
			return;
		}
		this.jobs[location] = 0;
		this.showJob(location);
	}
	static get observedAttributes () {
		return ['name', 'text'];
	}
	static blankPlaceList (value) {
		let placeList = {};
		for (let place of KerbalPlaces) {
			placeList[place] = value;
		}
		return placeList;
	}
	static valueToJob (value) {
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
	}
	/**
	 * Make a display element
	 * @param  {String} place Location
	 * @param  {Number} value Depth of visited required
	 * @return {HTMLElement} Element representing place+value
	 */
	static makeJobElement (place, value) {
		let p = document.createElement('p');
		p.style.margin = '5px 0px';
		p.style.borderRadius = '5px';
		p.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
		p.innerHTML = place + ' ' + this.valueToJob(value);
		return p;
	}
	static jobToValue (job) {
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
	}
}

Elements.load('kerbalTemplate.html', Elements.elements.Kerbal, 'elements-kerbal');

let makeThing = () => {
	let a = document.createElement('p');
	a.className = 'test';
	a.innerHTML = 'blah';
	return a;
}
