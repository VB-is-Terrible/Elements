'use strict';

Elements.get('kerbal-group-tag', 'KDB', 'dropdown', 'tab-window', 'kerbal-searcher-kerbal', 'kerbal-display_text');
{
const main = async () => {

await Elements.get('KDB', 'tab-window', 'drag-Common');

/**
 * UI to edit a KNS.Group
 * @type {Object}
 * @property {KNS.Group} group Group been edit - note: this is a copy, not the original
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.backbone2
 * @augments Elements.elements.tabbed2
 */
Elements.elements.KerbalEditorGroup = class KerbalEditorGroup extends Elements.elements.tabbed2 {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalEditorGroup';
		/**
		 * Temp group containing real kerbals, to track KDB status
		 * @type {KNS.Group}
		 * @private
		 */
		this.__group = null;
		/**
		 * Temp group with duplicated kerbals, to track kerbal status
		 * @type {KNS.Group}
		 * @private
		 */
		this.__virtualGroup = null;
		/**
		 * Concreate location of database attributes
		 * @type {String}
		 * @private
		 */
		this.__database = null;
		/**
		 * Reference to the group been edited
		 * @type {?KNS.Group}
		 * @private
		 */
		this.__oldValue = null;
		this.__displays = new Map();
		this.newChangeQueue();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let group = template.querySelector('elements-kerbal-group-tag');
		let nameInput = template.querySelector('#AnsName');
		let textInput = template.querySelector('#AnsText');
		let updater = template.querySelector('#Done');
		let AnsRemoveValue = template.querySelector('#AnsRemoveValue');
		let AnsRemovePlace = template.querySelector('#AnsRemovePlace');
		let AnsRemoveConfirm = template.querySelector('#AnsRemoveConfirm');
		let Delete1 = template.querySelector('#DeleteKerbal1');
		let Delete2 = template.querySelector('#DeleteKerbal2');
		let Delete3 = template.querySelector('#DeleteKerbal3');
		let DeleteWarning = template.querySelector('#deleted');
		let warn = template.querySelector('img.warn');
		let cancel = template.querySelector('#Cancel');
		let searcher = template.querySelector('elements-kerbal-searcher-kerbal');

		AnsRemoveConfirm.addEventListener('click', (e) => {
			let place = AnsRemovePlace.value;
			let value = AnsRemoveValue.value;
			if (self.group === null) {return;}
			self.__changeQueue.changes.push((group) => {
				group.removePlace(place, value);
			});
		});
		nameInput.addEventListener('keyup', (e) => {
			if (self.group === null) {return;}
			let name = nameInput.value;
			name = name.trim();
			if (name === '') {
				warn.style.display = 'block';
				updater.disabled = true;
			} else {
				warn.style.display = 'none';
				updater.disabled = false;
			}
			self.group.name = name;
			self.__changeQueue.name = name;
		});
		textInput.addEventListener('keyup', (e) => {
			if (self.group === null) {return;}
			let text = textInput.value.trim();
			self.group.text = text;
			self.__changeQueue.text = text;
		});
		cancel.addEventListener('click', (e) => {
			if (self.group === null) {return;}
			self.clearGroup();
			self.hideWindow();
		});
		updater.addEventListener('click', (e) => {
			if (self.group === null) {return;}
			self.applyChanges();
			self.clearGroup();
			self.hideWindow();
		});
		Delete1.addEventListener('click', (e) => {
			if (self.group === null) return;
			requestAnimationFrame(() => {
				Delete1.style.display = 'none';
				Delete2.style.display = 'block';
				Delete2.focus();
			});
		});
		Delete2.addEventListener('click', (e) => {
			if (self.group === null) return;
			self.__changeQueue.delete = true;
			DeleteWarning.style.display = 'flex';
			requestAnimationFrame(() => {
				Delete2.style.display = 'none';
				Delete3.style.display = 'block';
			});
		});
		Delete3.addEventListener('click', (e) => {
			if (self.group === null) return;
			self.__changeQueue.delete = false;
			DeleteWarning.style.display = 'none';
			requestAnimationFrame(() => {
				Delete3.style.display = 'none';
				Delete1.style.display = 'block';
			});
		});

		searcher.action = 'Include';
		searcher.parent = this;
		let includeCallback = (kerbal) => {
			self.addKerbal(kerbal);
		};
		searcher.actionCallback = includeCallback;

		Elements.common.stop_drag_events(template);
		shadow.appendChild(template);
		this.applyPriorProperties('database');
		this.applyPriorProperty('group', new KNS.Group());
	}
	get group () {
		return this.__group;
	}
	set group (value) {
		this.clearGroup();
		this.__oldValue = value;
		let tag = this.shadowRoot.querySelector('elements-kerbal-group-tag');
		let nameInput = this.shadowRoot.querySelector('#AnsName');
		let textInput = this.shadowRoot.querySelector('#AnsText');
		if (value !== null) {
			this.__group = value.duplicate(false);
			for (let kerbal of this.__group.kerbals) {
				this.addKerbalDisplay(kerbal);
			}
			tag.data = this.__group;
			nameInput.value = value.name;
			textInput.value = value.text;
		} else {
			this.__group = null;
			tag.data = null;
		}
	}
	get database () {
		return this.__database;
	}
	set database (value) {
		this.clearGroup();
		this.newChangeQueue();
		this.__database = value;
	}
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
			delete: false,
		};
	}
	/**
	 * Resets editor state
	 */
	clearGroup () {
		let group = this.shadowRoot.querySelector('elements-kerbal-group-tag');
		let nameInput = this.shadowRoot.querySelector('#AnsName');
		let textInput = this.shadowRoot.querySelector('#AnsText');
		let updater = this.shadowRoot.querySelector('#Done');
		let AnsRemoveValue = this.shadowRoot.querySelector('#AnsRemoveValue');
		let AnsRemovePlace = this.shadowRoot.querySelector('#AnsRemovePlace');
		let AnsRemoveConfirm = this.shadowRoot.querySelector('#AnsRemoveConfirm');
		let Delete1 = this.shadowRoot.querySelector('#DeleteKerbal1');
		let Delete2 = this.shadowRoot.querySelector('#DeleteKerbal2');
		let Delete3 = this.shadowRoot.querySelector('#DeleteKerbal3');
		let DeleteWarning = this.shadowRoot.querySelector('#deleted');
		let warn = this.shadowRoot.querySelector('img.warn');
		let cancel = this.shadowRoot.querySelector('#Cancel');
		let searcher = this.shadowRoot.querySelector('elements-kerbal-searcher-kerbal');

		this.data = null;
		this.newChangeQueue();
		for (let [kerbal, display] of this.__displays.entries()) {
			let text = display.querySelector('elements-kerbal-display_text');
			if (text !== null) {
				text.data = null;
			}
			requestAnimationFrame((e) => {
				display.remove();
			});
			this.__displays.delete(kerbal);
		}
		let location = this.shadowRoot.querySelector('#currentKerbals');
		if (location.childElementCount !== 0) {
			console.warn('Failed to clean display elements');
		}

		this.updateCount();
		nameInput.value = '';
		textInput.value = '';
		requestAnimationFrame((e) => {
			warn.style.display = 'block';
			Delete1.style.display = 'block';
			Delete2.style.display = 'none';
			Delete3.style.display = 'none';
			DeleteWarning.style.display = 'none';
		});
	}
	/**
	 * Add a kerbal to the group
	 * @param {KNS.Kerbal} kerbal Kerbal to add
	 * @private
	 */
	addKerbal (kerbal) {
		if (this.group === null) {return;}
		if (this.group.hasKerbal(kerbal)) {return;}
		this.group.addKerbal(kerbal);
		this.__changeQueue.changes.push((group) => {
			group.addKerbal(kerbal);
		});
		this.addKerbalDisplay(kerbal);
	}
	/**
	 * Add a kerbal to the current kerbals display element. Ignores repeation/sanity checks
	 * @param {KNS.Kerbal} kerbal Kerbal to display
	 */
	addKerbalDisplay (kerbal) {
		let location = this.shadowRoot.querySelector('#currentKerbals');
		let display = this.__makeDisplay(kerbal);
		requestAnimationFrame((e) => {
			location.appendChild(display);
		});
		this.__displays.set(kerbal, display);
		this.updateCount();
	}
	/**
	 * Make a new div displaying a search result
	 * @param  {KNS.Kerbal} kerbal Kerbal to show
	 * @return {HTMLElement}       A div containing the kerbal, edit button
	 * @private
	 */
	__makeDisplay (kerbal) {
		let div = document.createElement('div');
		div.classList.add('results');
		let display = document.createElement('elements-kerbal-display_text');
		display.classList.add('results');
		display.data = kerbal;
		div.appendChild(display);
		let button = document.createElement('button');
		button.textContent = 'Remove';
		button.classList.add('results');
		button.addEventListener('click', (e) => {
			this.deleteKerbal(kerbal);
		});
		div.appendChild(button);
		return div;
	}
	/**
	 * Remove a kerbal from the group
	 * @param  {KNS.Kerbal} kerbal Kerbal to remove
	 * @private
	 */
	deleteKerbal (kerbal) {
		if (this.group === null) {return;}
		this.group.deleteKerbal(kerbal);
		this.__changeQueue.changes.push((group) => {
			group.deleteKerbal(kerbal);
		});
		let display = this.__displays.get(kerbal);
		let text = display.querySelector('elements-kerbal-display_text');
		if (text !== null) {
			text.data = null;
		}
		requestAnimationFrame((e) => {
			display.remove();
		});
		this.__displays.delete(kerbal);
		this.updateCount();
	}
	/**
	 * Update the kerbal counter
	 */
	updateCount () {
		let counter = this.shadowRoot.querySelector(('#kerbalCount'));
		requestAnimationFrame((e) => {
			if (this.group.size !== 0) {
				counter.textContent = '(' + this.group.size.toString() + ')';
			} else {
				counter.textContent = '';
			}
		});
	}
	/**
	 * Applies queued changes
	 */
	applyChanges () {
		if (this.__oldValue === null) {
			return;
		}
		let group = this.__oldValue;
		if (this.__changeQueue.delete) {
			KerbalLink.get(this.database).deleteKerbal(kerbal.name);
			return;
		}
		if (this.__changeQueue.name !== null) {
			group.name = this.__changeQueue.name;
		}
		if (this.__changeQueue.text !== null) {
			group.text = this.__changeQueue.text;
		}
		for (let updater of this.__changeQueue.changes) {
			updater(group);
		}
	}
}

Elements.load(Elements.elements.KerbalEditorGroup, 'elements-kerbal-editor-group');
};

main();
}
