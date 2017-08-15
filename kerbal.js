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

		this.mo = new MutationObserver ((entries) => {
			console.log(entries);
		});

		this.moConfig = {
			childList: true,
			attributes: false,
			characterData: false,
			subTree: false,
			attributeOldValue: false,
			characterDataOldValue: false,
			// attributeFilter: [],
		};

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
		this.mo.observe(this, this.moConfig);
		// Any nodes already there won't be picked up by the mutation observer
		// Add them here
		//
		// Then fill it out with any missing nodes
	}
	disconnectedCallback () {
		this.mo.disconnect();
		// To avoid conflicts when reconnecting, empty all child nodes
	}
	addJob (place, value) {
		if (this.jobs[place] >= value) {
			return;
		}
		this.jobs[place] = value;
		if (this.jobDisplay[place] === null) {
			this.jobDisplay[place] = this.constructor.makeJobElement(place, value);
			this.append(this.jobDisplay[place]);
		} else {
			this.jobDisplay[place].innerHTML = place + ' ' + this.constructor.valueToJob(value);
		}
	}
	loadJob () {
		let split = (s) => {
			let location = s.indexOf(' ');
			return [s.substring(0, location), s.substring(location + 1)];
		}
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
		for (var i = this.children.length - 1; i >= 0; i--) {
			this.removeChild(this.children[i]);
		}
	}
	displayJobs () {
		
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
				return 'Fly-by';
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
				return '';
		}
	}
	static makeJobElement (place, value) {
		let p = document.createElement('p');
		p.style.margin = '5px 0px';
		p.style.borderRadius = '5px';
		p.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
		p.innerHTML = place + ' ' + this.valueToJob(value);
		return p;
	}
	static jobToValue (job) {
		switch (value) {
			case '':
				return 0;
				break;
			case 'Fly-by':
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
