'use strict';

Elements.get('dropdown', 'KDB', 'kerbal-tag');

{

const main = async () => {
await Elements.get('KDB');

/**
 * UI display of a kerbal, elements-kerbal
 * Note: many elements-kerbal -> one KNS.Kerbal
 * @type {Object}
 * @implements KerbalDisplay
 * @property {?KNS.Kerbal} data kerbal that this represents
 * @property {Boolean} menuvisible Whether destinations are visible
 * @property {?JobList} jobs Readonly reflection on data.jobs
 * @property {?String} name Readonly reflection on data.name
 * @property {Boolean} disabled=false Toggle to draw a big red x over the kerbal
 * @property {Boolean} deleter=true Toogle whether for the kerbal to remove itthis once the KNS.Kerbal is deleted
 * @augments Elements.elements.backbone2
 */
Elements.elements.KerbalDisplay = class extends Elements.elements.backbone2 {
	constructor () {
		super();

		const self = this;
		this.alias = 'KerbalDisplay';

		this.jobDisplay = KNS.blankPlaceList(null);
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.alias);
		shadow.appendChild(template);

		this._data = null;
		this.applyPriorProperty('data', null);
		this.__update = Elements.rafContext();
		this.__disabled = false;
		this.__deleter = false;
		this.applyPriorProperties('disabled', 'deleter');
		Elements.setUpAttrPropertyLink2(this, 'menuvisible', true, (value) => {
			let dragDown = self.shadowRoot.querySelector('elements-dropdown');
			dragDown.menuvisible = value;
		}, Elements.booleaner);
		Elements.setUpAttrPropertyLink2(this, 'disabled', false, (value) => {
			let overlay = this.shadowRoot.querySelector('#overlay');
			this.__update((e) => {
				overlay.style.display = value ? 'block' : 'none';
			});
		}, Elements.booleaner);
		Elements.setUpAttrPropertyLink2(this, 'deleter', false, () => {},
		                                Elements.booleaner);

	}
	get data () {
		return this._data;
	}
	set data (value) {
		if (this._data !== null) {
			this._data.removeDisplay(this);
		}
		this._data = value;
		if (value !== null) {
			value.addDisplay(this);
		}
		this.updateData();
		this.displayJobs();
	}
	get jobs () {
		if (this.data !== null) {
			return this.data.jobs;
		} else {
			return null;
		}
	}
	get name () {
		if (this.data !== null) {
			return this.data.name;
		} else {
			return null;
		}
	}
	connectedCallback () {
		super.connectedCallback();
		this.displayJobs();
	}
	/**
	 * Update name, text of kerbal
	 */
	updateData () {
		let kerbalTag = this.shadowRoot.querySelector('elements-kerbal-tag');
		if (this.data === null) {
			requestAnimationFrame(() => {
				kerbalTag.name = 'No kerbal';
				kerbalTag.text = 'No text';
			});
		} else {
			requestAnimationFrame(() => {
				if (this.data.name === '') {
					kerbalTag.name = '&nbsp';
				} else {
					kerbalTag.name = this.data.name;
				}
				kerbalTag.text = this.data.text;
			});
		}
	}
	/**
	* Displays held jobs
	*/
	displayJobs () {
		this.emptyNodes();
		if (this.data !== null) {
			for (let location of KNS.places) {
				this.showJob(location);
			}
		}
	}
	/**
	* Update the display for a job
	* @param  {String} location Location to update display
	*/
	showJob (location) {
		requestAnimationFrame(() => {
			if (this.data === null) {return;}
			let insertLocation = this.shadowRoot.querySelector('#jobs');
			let value = this.jobs[location];
			if (this.jobs[location] > 0) {
				if (this.jobDisplay[location] === null) {
					// A display element has not been made
					this.jobDisplay[location] = this.constructor.makeJobElement(location, value);
					insertLocation.appendChild(this.jobDisplay[location]);
				} else {
					this.jobDisplay[location].textContent = location + ' ' + KNS.valueToJob(value);
					if (!(insertLocation.contains(this.jobDisplay[location]))) {
						// A display element has been made, but has since been removed
						insertLocation.appendChild(this.jobDisplay[location]);
					}
				}
			} else {
				if (insertLocation.contains(this.jobDisplay[location])) {
					insertLocation.removeChild(this.jobDisplay[location]);
				}
			}
		});
	}
	/**
	 * Callback for KerbalDisplay
	 * @private
	 */
	delete () {
		if (this.deleter) {
			requestAnimationFrame((e) => {
				this.remove();
			});
		}
		if (this.data !== null) {
			this.data.removeDisplay(this);
		}
	}
	/**
	* Remove all children
	*/
	emptyNodes () {
		for (let i = this.children.length - 1; i >= 0; i--) {
			this.removeChild(this.children[i]);
		}
	}
	static get observedAttributes () {
		return ['menuvisible', 'disabled', 'deleter'];
	}
	/**
	* Make a display element
	* @param  {String} place Location
	* @param  {Number} value Depth of visited required
	* @return {HTMLElement} Element representing place+value
	*/
	static makeJobElement (place, value) {
		let p = document.createElement('p');
		p.textContent = place + ' ' + KNS.valueToJob(value);
		return p;
	}
}

Elements.load(Elements.elements.KerbalDisplay, 'elements-kerbal-display');
}

main();
}
