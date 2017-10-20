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

		//Fancy code goes here
		shadow.appendChild(template);
	}
}

Elements.load('kerbalMakerGroupTemplate.html', Elements.elements.KerbalMakerGroup, 'elements-kerbal-maker-group');
};

main();
}
