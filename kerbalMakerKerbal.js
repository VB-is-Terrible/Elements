'use strict';

Elements.get('kerbal', 'grid', 'kerbal-link', 'tab-window', 'KDB');
{
const defaultJob = "Tourist";
const main = async () => {

await Elements.get('tab-window', 'kerbal-link', 'KDB');

/**
 * UI to make a KNS.Kerbal
 * @type {Object}
 * @property {Object} elements Store of useful UI elements
 * @property {KNS.Kerbal} data Kerbal been made
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.tabbed
 */
Elements.elements.KerbalMakerKerbal = class extends Elements.elements.tabbed {
	constructor () {
		super();

		const self = this;
		this.name = 'KerbalMakerKerbal';
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
		this.__database = this.database || 'default';
		Object.defineProperty(this, 'database', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__database;
			},
			set: (value) => {
				self.__database = value;
				// As the existing kerbals have changed, check the name again
				self.nameChange();
			},
		});

		this.__nameRAF = Elements.rafContext();
		applyEL('nameInput', 'keyup', (e) => {
			this.nameChange();
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
		shadow.appendChild(template);
		this.newKerbal();
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
	 * Gets new name from UI, and runs checks for invalid name, then updates UI
	 * @private
	 */
	nameChange () {
		let f;
		let name = this.elements.nameInput.value;
		name = name.trim();
		if (name !== '&nbsp;' || this.nameChanged) {
			name = Elements.nameSanitizer(name);
		}
		if (KerbalLink.get(this.database).kerbals.has(name)) {
			f = () => {
				this.elements.warn.style.display = 'block';
				this.elements.warn.title = "Kerbal already exists";
				this.elements.nameInput.style.color = 'red';
			};
			this.elements.kerbal.disabled = true;
			this.elements.updater.disabled = true;
			this.nameValid = false;
		} else if (name === "&nbsp;" || name === '') {
			f = () => {
				this.elements.warn.style.display = 'block';
				this.elements.warn.title = "Please enter a name";
				this.elements.nameInput.style.color = 'red';
			}
			this.elements.kerbal.disabled = true;
			this.elements.updater.disabled = true;
			this.nameValid = false;
			name = '&nbsp;';
		} else {
			f = () => {
				this.elements.warn.style.display = 'none';
				this.elements.nameInput.style.color = 'initial';
			};
			this.nameValid = true;
			this.nameChanged = true;
			this.elements.kerbal.disabled = false;
			this.elements.updater.disabled = false;
		}
		this.data.name = name;
		this.__nameRAF(f);
	}
}

Elements.load('kerbalMakerKerbalTemplate.html', Elements.elements.KerbalMakerKerbal, 'elements-kerbal-maker-kerbal');
};

main();
}
