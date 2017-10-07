'use strict';

Elements.get('drag-down', 'KDB', 'kerbal-tag');

// Move this to config later
Elements.await(function () {
	/**
	 * UI display of a kerbal, elements-kerbal
	 * Note: many elements-kerbal -> one KNS.Kerbal
	 * @type {Object}
	 * @implements KerbalDisplay
	 * @property {KNS.Kerbal} data kerbal that this represents
	 * @property {Boolean} menuvisible Whether destinations are visible
	 * @property {JobList} jobs Readonly reflection on data.jobs
	 * @property {String} name Readonly reflection on data.name
	 * @property {Boolean} disabled=false Toggle to draw a big red x over the kerbal
	 * @property {Boolean} deleter=true Toogle whether for the kerbal to remove itself once the KNS.Kerbal is deleted
	 * @augments Elements.elements.backbone
	 */
	Elements.elements.Kerbal = class extends Elements.elements.backbone {
		constructor () {
			super();

			const self = this;
			this.alias = 'Kerbal';
			if (!this.data) {
				this._data = new KNS.Kerbal();
				this._data.addDisplay(this);
			} else {
				this._data = this.data;
			}
			Object.defineProperty(this, 'data', {
				enumerable: true,
				configurable: true,
				get: () => {
					return self._data;
				},
				set: (value) => {
					this._data.removeDisplay(this);
					if (value === null) {
						value = new KNS.Kerbal();
						value.name = '';
						value.text = '';
					}
					self._data = value;
					value.addDisplay(this);
					self.updateData();
					self.displayJobs();
				},
			});
			let definer = (names) => {
				for (let name of names) {
					Object.defineProperty(self, name, {
						enumerable: true,
						configurable: false,
						get: () => {
							return self.data[name];
						},
						set: (value) => {
							console.warn('Cannot set ' + name);
						},
					});
				}
			};

			definer(['jobs', 'name']);
			this.jobDisplay = KNS.blankPlaceList(null);
			const shadow = this.attachShadow({mode: 'open'});
			let template = Elements.importTemplate(this.alias);

			let dragDown = template.querySelector('elements-drag-down');
			Elements.setUpAttrPropertyLink(this, 'menuvisible', true,
			                               (value) => {dragDown.menuvisible = value;},
									       Elements.booleaner);
			let overlay = template.querySelector('#overlay');
			this.update = null;
			let disable = (value) => {
				if (self.update !== null) {
					cancelAnimationFrame(self.update);
				}
				self.update = requestAnimationFrame(() => {
					overlay.style.display = value ? 'block' : 'none';
					self.update = null;
				});
			};
			Elements.setUpAttrPropertyLink(this, 'disabled', false,
			                               disable, Elements.booleaner);
			Elements.setUpAttrPropertyLink(this, 'deleter', true,
			                               () => {}, Elements.booleaner);

			shadow.appendChild(template);
			this.updateData();
		}

		connectedCallback () {
			super.connectedCallback();
			this.displayJobs();
		}
		/**
		 * Update name, text of kerbal
		 */
		updateData () {
			requestAnimationFrame(() => {
				let kerbalTag = this.shadowRoot.querySelector('elements-kerbal-tag');
				kerbalTag.name = this.data.name;
				kerbalTag.text = this.data.text;
			});
		}
		/**
		* Displays held jobs
		*/
		displayJobs () {
			this.emptyNodes();
			for (let location of KNS.places) {
				this.showJob(location);
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
				this.remove();
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
