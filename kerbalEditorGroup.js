'use strict';

Elements.get('kerbal-group-tag', 'KDB', 'drag-down');
{
const main = async () => {

await Elements.get('KDB');

/**
 * UI to edit a KNS.Group
 * @type {Object}
 * @property {KNS.Group} group Group been edit - note: this is a copy, not the original
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.backbone2
 * @augments Elements.elements.tabbed2
 */
Elements.elements.KerbalEditorGroup = class extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalEditorGroup';
		this.__group = null;
		this.__database = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		shadow.appendChild(template);
		this.applyPriorProperties('database', 'group');
	}
	get group () {
		return this.__group;
	}
	set group (value) {
		this.__group = value;
	}
	get database () {
		return this.__database;
	}
	set database (value) {
		this.__database = value;
	}
}

Elements.load('kerbalEditorGroupTemplate.html', Elements.elements.KerbalEditorGroup, 'elements-kerbal-editor-group');
};

main();
}
