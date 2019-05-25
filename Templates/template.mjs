export const recommends = [];
export const requires = [];

import {Elements} from '$4Elements.mjs';

/**
 * [$1 Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
export class $1 extends Elements.elements.backbone3 {
	constructor () {
		super();
		const self = this;

		this.name = '$1';
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

Elements.elements.$1 = $1;

Elements.load(Elements.elements.$1, 'elements-$2');
