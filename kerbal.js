'use strict'

Elements.require('drag-down');

// Move this to config later
const KerbalPlaces = ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo'];
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
			this.jobDisplay[place].innerHTML = this.constructor.valueToJob(value);
		}
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
		p.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);';
		p.innerHTML = place + this.valueToJob(value);
		return p;
	}
}

Elements.load('kerbalTemplate.html', Elements.elements.Kerbal, 'elements-kerbal');

let makeThing = () => {
	let a = document.createElement('p');
	a.className = 'test';
	a.innerHTML = 'blah';
	return a;
}
