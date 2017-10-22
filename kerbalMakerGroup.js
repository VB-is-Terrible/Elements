'use strict';

Elements.get('kerbal-searcher-kerbal');
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
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let searcher = template.querySelector('elements-kerbal-searcher-kerbal');
		searcher.edit = 'Include';
		Object.defineProperty(this, 'database', {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__database;
			},
			set: (value) => {
				self.__database = value;
				searcher.database = value;
			},
		});

		let includeCallback = (name) => {
			let kerbal = KerbalLink.get(this.database).getKerbal(name);
			this.group.addKerbal(kerbal);
		}
		let ansName = template.querySelector('#AnsName');
		ansName.addEventListener('change', (e) => {
			let name = ansName.value;
			if (name === '') {
				//TODO: Show warning
				this.nameValid = false;
			} else {
				this.nameValid = true;
				// TODO: Hide warning
			}
			this.group.name = name;
		});
		let ansText = template.querySelector('#AnsText');
		ansText.addEventListener('change', (e) => {
			let text = ansText.value;
			this.group.text = text;
		});

		let canceler = (e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
			// e.preventDefault();
			self.drag_reset();
			self.touch_reset();
		};
		for (let input of template.querySelectorAll('input')) {
			input.addEventListener('mousedown', canceler);
			input.addEventListener('dragstart', canceler);
			// input.addEventListener('touchstart', canceler);
		}
		shadow.appendChild(template);
	}
}

Elements.load('kerbalMakerGroupTemplate.html', Elements.elements.KerbalMakerGroup, 'elements-kerbal-maker-group');
};

main();
}
