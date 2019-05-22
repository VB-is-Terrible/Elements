export const recommends = [];
export const requires = [];

import {Elements} from '../Elements.mjs';

/**
 * Test page for display a project
 * @augments Elements.elements.backbone2
 * @memberof Elements.elements
 */
export class Test extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = 'Test';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback () {
		super.connectedCallback();
	}
	disconnectedCallback () {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return [];
	}

}

Elements.elements.Test = Test;

Elements.load(Elements.elements.Test, 'elements-test');

console.log('sdjlfkaskldf');
