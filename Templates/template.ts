// @ts-nocheck
export const recommends = [];
export const requires = [];

import {Elements} from '$4elements_core.js';
import {backbone4} from '$4elements_backbone.js';
import {} from '$4elements_helper.js'


const ELEMENT_NAME = '$1';
/**
 * [$1 Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class $1 extends backbone4 {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME) as HTMLElement;

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

Elements.elements.$1 = $1;

Elements.load($1, 'elements-$2');
