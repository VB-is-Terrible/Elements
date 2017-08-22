'use strict'

Elements.require('drag-down', 'KDB', 'kerbal-tag');

// Move this to config later
Elements.await(function () {
	Elements.elements.Kerbal = class extends Elements.elements.backbone {
		constructor () {
			super();

			this.alias = "Kerbal";
			if (!this.data) {
				this._data = new KNS.Kerbal();
				this._data.displays.push(this);
			} else {
				this._data = this.data;
			}
			Object.defineProperty(this, 'data', {
				enumerable: true,
				configurable: true,
				get: () => {
					return this._data;
				},
				set: (value) => {
					this._data = value;
					this.updateData();
					this.displayJobs();
				},
			});
			let definer = (names) => {
				for (let name of names) {
					Object.defineProperty(this, name, {
						enumerable: true,
						configurable: false,
						get: () => {
							return this.data[name];
						},
						set: (value) => {
							console.warn('Cannot set ' + name);
						},
					});
				}
			};

			definer(['jobs', 'name']);
			this.jobDisplay = this.constructor.blankPlaceList(null);
			let shadow = this.attachShadow({mode: 'open'});
			let template = Elements.importTemplate(this.alias);

			let dragDown = template.querySelector('elements-drag-down');

			shadow.appendChild(template);
			this.updateData();
		}

		connectedCallback () {
			super.connectedCallback();
			this.displayJobs();
		}
		disconnectedCallback () {
			this.emptyNodes();
			// To avoid conflicts when reconnecting, empty all child nodes
		}
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
				let value = this.jobs[location];
				if (this.jobs[location] > 0) {
					if (this.jobDisplay[location] === null) {
						// A display element has not been made
						this.jobDisplay[location] = this.constructor.makeJobElement(location, value);
						this.appendChild(this.jobDisplay[location]);
					} else {
						this.jobDisplay[location].innerHTML = location + ' ' + KNS.valueToJob(value);
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
		static get observedAttributes () {
			return ['name', 'text'];
		}
		static blankPlaceList (value) {
			let placeList = {};
			for (let place of KNS.places) {
				placeList[place] = value;
			}
			return placeList;
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
			p.innerHTML = place + ' ' + KNS.valueToJob(value);
			return p;
		}
	}

	Elements.load('kerbalTemplate.html', Elements.elements.Kerbal, 'elements-kerbal');

}, 'KDB');
