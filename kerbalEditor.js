'use strict';


/**
 * UpdaterFunction
 * @callback UpdaterFunction
 * @param {KNS.Kerbal} Kerbal Kerbal to update
 */
{
const temp = (async () => {

Elements.get('grid', 'drag-down')
await Elements.get('kerbal', 'kerbal-link', 'drag-element');

/**
 * UI to edit a KNS.Kerbal
 * @type {Object}
 * @property {Object} UI Store of useful UI elements
 * @property {KNS.Kerbal} data Kerbal been edit - note: this is a copy, not the original
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalEditor = class extends Elements.elements.dragged {
	constructor () {
		super();

		const self = this;
		this.name = 'KerbalEditor';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let UI = {};

		let findElements = (...nameQSpairs) => {
			for (let pair of nameQSpairs) {
				UI[pair[0]] = template.querySelector(pair[1]);
			}
		};

		let applyEL = (elementName, event, callback) => {
			UI[elementName].addEventListener(event, callback);
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
			['cancel', '#Cancel'],
		);

		this.database = this.database || 'default';
		this.__data = this.data || null;
		/**
		 * Kerbal been edited
		 * @type {?KNS.Kerbal}
		 */
		this.__oldValue = null;
		if (this.__data !== null) {
			this.__oldValue = this.__data;
			this.__data = this.constructer.duplicateKerbal(this.__oldValue);
		}

		this.newChangeQueue();
		Object.defineProperty(this, 'data', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__data;
			},
			set: (value) => {
				self.__oldValue = value
				if (value !== null) {
					self.__data = self.constructor.duplicateKerbal(value);
					UI.kerbal.data = this.data;
					this.data.displays.push(UI.kerbal);
				} else {
					self.__data = new KNS.Kerbal();
					self.__data.name = '';
					self.__data.text = '';
					UI.kerbal.data = this.data;
					this.data.displays.push(UI.kerbal);
				}
				// Fill the UI
				// Desantize the name
				UI.nameInput.value = KNS.nameDesanitizer(this.data.name);
				UI.typeInput.value = this.data.text;
				// Reset the UI
				UI.warn.style.display = 'none';
			},
		});

		applyEL('nameInput', 'keyup', (e) => {
			let name = UI.nameInput.value;
			name = KNS.nameSanitizer(name);
			if (KerbalLink.get(self.database).kerbals.has(name) && name !== self.__oldValue.name) {
				UI.warn.style.display = 'block';
				UI.nameInput.style.color = 'red';
				UI.kerbal.disabled = true;
				UI.updater.disabled = true;
			} else if (UI.nameInput.value !== '') {
				self.data.name = UI.nameInput.value;
				UI.warn.style.display = 'none';
				UI.nameInput.style.color = 'initial';
				self.__changeQueue.name = UI.nameInput.value;
				UI.kerbal.disabled = false;
				UI.updater.disabled = false;
			} else {
				self.data.name = self.__oldValue.name;
				UI.warn.style.display = 'none';
				UI.nameInput.style.color = 'initial';
				self.__changeQueue.name = null;
				UI.kerbal.disabled = false;
				UI.updater.disabled = false;
			}
		});
		applyEL('typeInput', 'change', (e) => {
			self.data.text = UI.typeInput.value;
			self.__changeQueue.text = UI.typeInput.value;
		});
		applyEL('AnsAddConfirm', 'click', (e) => {
			let location = UI.AnsAddPlace.value;
			let value = parseInt(UI.AnsAddValue.value);
			self.data.removeJob(location, KNS.MAX_JOB_VALUE);
			self.data.addJob(location, value);
			self.__changeQueue.changes.push((kerbal) => {
				kerbal.removeJob(location, KNS.MAX_JOB_VALUE);
				kerbal.addJob(location, value);
			});
		});
		applyEL('AnsRemoveConfirm', 'click', (e) => {
			let location = UI.AnsRemovePlace.value;
			self.data.removeJob(location, KNS.MAX_JOB_VALUE);
			self.__changeQueue.changes.push((kerbal) => {
				kerbal.removeJob(location, KNS.MAX_JOB_VALUE);
			});
		});
		applyEL('updater', 'click', (e) => {
			self.applyChanges();
			self.clearKerbal();
			self.hideWindow();
		});
		applyEL('cancel', 'click', (e) => {
			self.clearKerbal();
			self.hideWindow()
		});
		applyEL('close', 'click', (e) => {
			self.hideWindow();
		})
		this.UI = UI;
		this.data = this.data || new KNS.Kerbal();
		shadow.appendChild(template);
	}
	/**
	 * Resets editor state
	 */
	clearKerbal () {
		this.data = null;
		this.newChangeQueue();
	}
	/**
	 * Applies queued changes
	 */
	applyChanges () {
		let kerbal = this.__oldValue;
		if (this.__changeQueue.name !== null) {
			KerbalLink.get(this.database).renameKerbal(kerbal.name, this.__changeQueue.name);
		}
		if (this.__changeQueue.text !== null) {
			kerbal.text = this.__changeQueue.text;
		}
		for (let updater of this.__changeQueue.changes) {
			updater(kerbal);
		}
	};
	/**
	 * Empties change queue
	 */
	newChangeQueue () {
		/**
		 * Stores updater functions. These are called when done is pressed,
		 * and discarded if cancel is clicked
		 * @type {Object}
		 * @property {?String} name name
		 * @property {?String} text text
		 * @property {UpdaterFunction[]} changes array of updaters for places
		 */
		this.__changeQueue = {
			name: null,
			text: null,
			changes: [],
		};
	}
	/**
	 * Shallow copy a kerbal
	 * @param  {KNS.Kerbal} kerbal
	 * @return {KNS.Kerbal}
	 */
	static duplicateKerbal (kerbal) {
		return KNS.Kerbal.fromJSONObj(JSON.parse(JSON.stringify(kerbal)));
	}
}

Elements.load('kerbalEditorTemplate.html', Elements.elements.KerbalEditor, 'elements-kerbal-editor');
});
temp();
}
