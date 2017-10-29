'use strict';

Elements.get('drag-down', 'KDB', 'kerbal-tag');

// Move this to config later
Elements.await(function () {
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
	 * @property {Boolean} deleter=true Toogle whether for the kerbal to remove itself once the KNS.Kerbal is deleted
	 * @augments Elements.elements.backbone2
	 */
	Elements.elements.Kerbal = class extends Elements.elements.backbone2 {
		constructor () {
			super();

			const self = this;
			this.alias = 'Kerbal';

			this.jobDisplay = KNS.blankPlaceList(null);
			const shadow = this.attachShadow({mode: 'open'});
			let template = Elements.importTemplate(this.alias);
			shadow.appendChild(template);

			this._data = null;
			this.applyPriorProperty('data', null);
			this.__menuvisible = true;
			this.__update = Elements.rafContext();
			this.__disabled = false;
			this.__deleter = false;
			this.applyPriorProperties('menuvisible', 'disabled', 'deleter');
		}
		get data () {
			return self._data;
		}
		set data () {
			if (this._data !== null) {
				this._data.removeDisplay(this);
			}
			self._data = value;
			if (value !== null) {
				value.addDisplay(this);
			}
			self.updateData();
			self.displayJobs();
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
		get menuvisible () {
			return this.__menuvisible;
		}
		set menuvisible (value) {
			value = Elements.booleaner(value);
			if (value === this.menuvisible) {return;}
			this.__menuvisible = value;
			if (this.attributeInit) {
				this.setAttribute('menuvisible', value);
			}
			let dragDown = this.shadowRoot.querySelector('elements-drag-down');
			dragDown.menuvisible = value;
		}
		get disabled () {
			return this.__disabled;
		}
		set disabled (value) {
			value = Elements.booleaner(value);
			if (value === this.disabled) {return;}
			this.__disabled = value;
			if (this.attributeInit) {
				this.setAttribute('disabled', value);
			}
			let overlay = this.shadowRoot.querySelector('#overlay');
			this.__update((e) => {
				overlay.style.display = value ? 'block' : 'none';
			});
		}
		get deleter () {
			return this.__deleter;
		}
		set deleter (value) {
			value = Elements.booleaner(value);
			if (value === this.deleter) {return;}
			this.__deleter = value;
			if (this.attributeInit) {
				this.setAttribute('deleter', value);
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
						kerbalTag.name = Elements.nameSanitizer(this.data.name);
					}
					kerbalTag.text = Elements.nameSanitizer(this.data.text);
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
				let insertLocation = this.shadowRoot.querySelector('#jobs');
				let value = this.jobs[location];
				if (this.jobs[location] > 0) {
					if (this.jobDisplay[location] === null) {
						// A display element has not been made
						this.jobDisplay[location] = this.constructor.makeJobElement(location, value);
						insertLocation.appendChild(this.jobDisplay[location]);
					} else {
						this.jobDisplay[location].innerHTML = location + ' ' + KNS.valueToJob(value);
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
			for (var i = this.children.length - 1; i >= 0; i--) {
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
			p.innerHTML = place + ' ' + KNS.valueToJob(value);
			return p;
		}
	}

	Elements.load('kerbalTemplate.html', Elements.elements.Kerbal, 'elements-kerbal');

}, 'KDB');
