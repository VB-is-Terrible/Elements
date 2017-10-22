'use strict';

Elements.get('kerbal-searcher-kerbal');
{
const main = async () => {

await Elements.get('tab-window', 'KDB');

/**
 * UI to make a KNS.Group
 * @type {Object}
 * @property {Object} UI Store of useful UI elements
 * @property {KNS.Kerbal} group Group been made
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.tabbed
 */
Elements.elements.KerbalMakerGroup = class extends Elements.elements.tabbed {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalMakerGroup';
		this.__database = this.database || 'default';
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
		let canceler = (e) => {
			e.stopPropagation();
			e.stopImmediatePropagation();
			// e.preventDefault();
			this.parentElement.drag_reset();
			this.parentElement.touch_reset();
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
