export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

/**
 * [ContainerAutohide Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class ContainerAutohide extends Elements.elements.backbone3 {
	constructor() {
		super();

		this.name = 'ContainerAutohide';
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


export {ContainerAutohide};
export default ContainerAutohide;

Elements.elements.ContainerAutohide = ContainerAutohide;

Elements.load(ContainerAutohide, 'elements-container-autohide');
