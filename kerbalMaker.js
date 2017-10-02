'use strict';

Elements.get('kerbal', 'grid', 'kerbal-link', 'drag-element');
Elements.await(() => {
const defaultJob = "Tourist";
/**
 * UI to make a KNS.Kerbal
 * @type {Object}
 * @property {Object} elements Store of useful UI elements
 * @property {KNS.Kerbal} data Kerbal been made
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalMaker = class extends Elements.elements.dragged {
	constructor () {
		super();

		const self = this;
		this.name = 'KerbalMaker';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let elements = {};
		let findElements = (...nameQSpairs) => {
			for (let pair of nameQSpairs) {
				elements[pair[0]] = template.querySelector(pair[1]);
			}
		};
		let applyEL = (elementName, event, callback) => {
			elements[elementName].addEventListener(event, callback);
		};
		findElements(
			['kerbal', 'elements-kerbal'],
			['nameInput', '#AnsName'],
			['typeInput', '#AnsText'],
			['updater', '#Done'],
			['AnsAddPlace', '#AnsAddPlace'],
			['AnsAddValue', '#AnsAddValue'],
			['AnsAddConfirm', '#AnsAddConfirm'],
			['AnsRemovePlace', '#AnsRemovePlace'],
			['AnsRemoveConfirm', '#AnsRemoveConfirm'],
			['warn', 'img.warn'],
			['close', '#Close'],
		);
		Object.defineProperty(this, 'data', {
			enumerable: true,
			configurable: false,
			get: () => {
				return elements.kerbal.data;
			},
			set: (value) => {
				elements.kerbal.data = value;
			},
		});
		this.nameValid = false;
		this.nameChanged = false;
		this.database = this.database || 'default';
		let nameRAF = null;
		applyEL('nameInput', 'keyup', (e) => {
			let f = null;
			if (nameRAF !== null) {
				cancelAnimationFrame(nameRAF);
			}
			let name = elements.nameInput.value;
			name = name.trim();
			if (name !== '&nbsp;' || this.nameChanged) {
				name = KNS.nameSanitizer(name);
			}
			if (KerbalLink.get(self.database).kerbals.has(name)) {
				f = () => {
					elements.warn.style.display = 'block';
					elements.warn.title = "Kerbal already exists";
					elements.nameInput.style.color = 'red';
				};
				elements.kerbal.disabled = true;
				elements.updater.disabled = true;
				self.nameValid = false;
			} else if (name === "&nbsp;" || name === '') {
				f = () => {
					elements.warn.style.display = 'block';
					elements.warn.title = "Please enter a name";
					elements.nameInput.style.color = 'red';
				}
				elements.kerbal.disabled = true;
				elements.updater.disabled = true;
				self.nameValid = false;
				name = '&nbsp;';
			} else {
				f = () => {
					elements.warn.style.display = 'none';
					elements.nameInput.style.color = 'initial';
				};
				self.nameValid = true;
				self.nameChanged = true;
				elements.kerbal.disabled = false;
				elements.updater.disabled = false;
			}
			self.data.name = name;
			nameRAF = requestAnimationFrame(() => {
				f();
				nameRAF = null;
			});
		});
		applyEL('typeInput', 'change', (e) => {
			self.data.text = elements.typeInput.value;
		});
		applyEL('AnsAddConfirm', 'click', (e) => {
			let location = elements.AnsAddPlace.value;
			let value = parseInt(elements.AnsAddValue.value);
			if (location !== '') {
				self.data.removeJob(location, KNS.MAX_JOB_VALUE);
				self.data.addJob(location, value);
			}
			elements.AnsAddPlace.value = '';
			elements.AnsAddPlace.focus();
		});
		applyEL('AnsRemoveConfirm', 'click', (e) => {
			let location = elements.AnsRemovePlace.value;
			if (location !== '') {
				self.data.removeJob(location, KNS.MAX_JOB_VALUE);
			}
			elements.AnsRemovePlace.focus();
		});
		applyEL('updater', 'click', (e) => {
			if (!(self.nameValid)) {
				return;
			}
			KerbalLink.get(self.database).addKerbal(self.data);
			self.data.removeDisplay(self.elements.kerbal);
			self.newKerbal();
		});
		applyEL('close', 'click', (e) => {
			self.hideWindow();
		});
		this.elements = elements;
		this.newKerbal();
		shadow.appendChild(template);
	}
	/**
	 * Reset the maker
	 */
	newKerbal () {
		this.data = new KNS.Kerbal();
		this.data.name = '&nbsp;';
		this.data.text = defaultJob;
		this.elements.kerbal.data = this.data;
		this.nameChanged = false;
		this.nameValid = false;
		this.elements.nameInput.value = '';
		this.elements.typeInput.value = defaultJob;
		this.elements.AnsAddPlace.value = 'Mun';
		this.elements.AnsAddValue.value = 4;
		this.elements.AnsRemovePlace.value = '';
		this.elements.warn.display = "block";
	}
	/**
	 * Reset the maker
	 */
	reset () {
		this.data.removeDisplay(this.elements.kerbal);
		this.newKerbal();
	}
}

Elements.load('kerbalMakerTemplate.html', Elements.elements.KerbalMaker, 'elements-kerbal-maker');
}, 'kerbal-link', 'drag-element');
