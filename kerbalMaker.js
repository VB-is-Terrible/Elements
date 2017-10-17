'use strict';

Elements.get('drag-element', 'kerbal-maker-kerbal', 'tab-window');
{
const main = async () => {

await Elements.get('drag-element');
/**
 * Combined UI to make a KNS.Kerbal or KNS.Group
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalMaker = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalMaker';
		this.__database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		// Object.defineProperty(this, 'database', {
		// 	enumerable: true,
		// 	configurable: false,
		// 	get: () => {
		// 		return self.__database;
		// 	},
		// 	set: (value) => {
		// 		self.__database = value;
		// 		// As the existing kerbals have changed, check the name again
		// 		self.nameChange();
		// 	},
		// });

		//Fancy code goes here
		shadow.appendChild(template);
	}
}

Elements.load('kerbalMakerTemplate.html', Elements.elements.KerbalMaker, 'elements-kerbal-maker');
};

main();
}
