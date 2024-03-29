export const recommends = [];
export const requires = [];

import {Elements} from '$4elements_core.js';

/**
 * [$1 Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
export class $1 extends Elements.elements.backbone3 {
	constructor() {
		super();

		this.name = '$1';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	static get observedAttributes() {
		return [];
	}

}

export default $1;

Elements.load($1, 'elements-$2');
