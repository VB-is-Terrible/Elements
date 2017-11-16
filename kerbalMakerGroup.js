'use strict';

Elements.get('kerbal-searcher-kerbal', 'kerbal-display-text', 'tab-window', 'KDB', 'main');
{
const main = async () => {

await Elements.get('tab-window', 'KDB', 'main');

/**
 * UI to make a KNS.Group
 * @type {Object}
 * @property {Object} UI Store of useful UI elements
 * @property {KNS.Group} group Group been made
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.tabbed
 */
Elements.elements.KerbalMakerGroup = class extends Elements.elements.tabbed {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalMakerGroup';
		this.__database = this.database || 'default';
		this.group = new KNS.Group();
		this.nameValid = false;
		this.__displays = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let searcher = template.querySelector('elements-kerbal-searcher-kerbal');
		searcher.action = 'Include';
		searcher.parent = this;
		Object.defineProperty(this, 'database', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__database;
			},
			set: (value) => {
				self.newGroup();
				self.__database = value;
				searcher.database = value;
			},
		});

		let includeCallback = (kerbal) => {
			self.addKerbal(kerbal);
		};
		searcher.actionCallback = includeCallback;
		let ansName = template.querySelector('#AnsName');
		let warn = template.querySelector('img.warn');
		let done = template.querySelector('#Done');
		ansName.addEventListener('keyup', (e) => {
			let name = ansName.value.trim();
			if (name === '') {
				warn.style.display = 'block';
				this.nameValid = false;
				done.disabled = true;
			} else {
				this.nameValid = true;
				warn.style.display = 'none';
				done.disabled = false;
			}
			this.group.name = name;
		});
		let ansText = template.querySelector('#AnsText');
		ansText.addEventListener('change', (e) => {
			let text = ansText.value.trim();
			this.group.text = text;
		});

		for (let input of template.querySelectorAll('input')) {
			if (input.type === 'text') {
				input.addEventListener('mousedown', (e) => {
					e.stopPropagation();
				});
			}
		}
		let kerbalDisplay = template.querySelector('#currentKerbals');
		kerbalDisplay.addEventListener('touchstart', (e) => {
			self.touch_reset();
			e.stopPropagation();
		});

		let cancel = template.querySelector(('#Cancel'));
		cancel.addEventListener('click', (e) => {
			self.newGroup();
			self.hideWindow();
		});
		done.addEventListener('click', (e) => {
			if (!self.nameValid) {return;}
			KerbalLink.get(self.database).addGroup(self.group);
			self.newGroup();
		});
		shadow.appendChild(template);
	}
	/**
	 * Add a kerbal to the group
	 * @param {KNS.Kerbal} kerbal Kerbal to add
	 * @private
	 */
	addKerbal (kerbal) {
		if (this.group.hasKerbal(kerbal)) {return;}
		this.group.addKerbal(kerbal);
		let location = this.shadowRoot.querySelector('#currentKerbals');
		let display = this.__makeDisplay(kerbal);
		requestAnimationFrame((e) => {
			location.appendChild(display);
		});
		this.__displays.set(kerbal, display);
		this.updateCount();
	}
	/**
	 * Remove a kerbal from the group
	 * @param  {KNS.Kerbal} kerbal Kerbal to remove
	 * @private
	 */
	deleteKerbal (kerbal) {
		this.group.deleteKerbal(kerbal);
		let display = this.__displays.get(kerbal);
		let text = display.querySelector('elements-kerbal-display-text');
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
	 * Reset the current group
	 */
	newGroup () {
		this.group = new KNS.Group();
		let ansName = this.shadowRoot.querySelector('#AnsName');
		let warn = this.shadowRoot.querySelector('img.warn');
		ansName.value = '';
		let ansText = this.shadowRoot.querySelector('#AnsText');
		ansText.value = '';
		for (let [kerbal, display] of this.__displays.entries()) {
			let text = display.querySelector('elements-kerbal-display-text');
			if (text !== null) {
				text.data = null;
			}
			requestAnimationFrame((e) => {
				display.remove();
			});
			this.__displays.delete(kerbal);
		}
		let location = this.shadowRoot.querySelector('#currentKerbals');
		requestAnimationFrame((e) => {
			if (location.childElementCount !== 0) {
				console.warn('Failed to clean display elements');
			}
		});
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
		let display = document.createElement('elements-kerbal-display-text');
		display.classList.add('results');
		display.data = kerbal;
		div.appendChild(display);
		let button = document.createElement('button');
		button.innerHTML = 'Remove';
		button.classList.add('results');
		button.addEventListener('click', (e) => {
			this.deleteKerbal(kerbal);
		});
		div.appendChild(button);
		return div;
	}
	/**
	 * Update the kerbal counter
	 */
	updateCount () {
		let counter = this.shadowRoot.querySelector(('#kerbalCount'));
		requestAnimationFrame((e) => {
			if (this.group.size !== 0) {
				counter.innerHTML = '(' + this.group.size.toString() + ')';
			} else {
				counter.innerHTML = '';
			}
		});
	}
}

Elements.load('kerbalMakerGroupTemplate.html', Elements.elements.KerbalMakerGroup, 'elements-kerbal-maker-group');
};

main();
}
