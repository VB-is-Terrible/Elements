export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

/**
 * [ContainerAutohide Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class ContainerAutohide extends Elements.elements.backbone3 {
	_show_offset = '.75em';
	_expander;
	constructor() {
		super();

		this.name = 'ContainerAutohide';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);
		this._expander = template.querySelector('#expander');
		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperties('show_offset')
	}
	get show_offset() {
		return this._show_offset;
	}
	set show_offset(value) {
		if (value === this._show_offset) {
			return;
		}
		this._show_offset = value;
		requestAnimationFrame(() => {
			this._expander.style.transform = 'translate(0, calc(-100% + ' + value + ' + 1em))';
		});
		if (this.attributeInit) {
			this.setAttribute('show_offset', value);
		}
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	static get observedAttributes() {
		return ['show_offset'];
	}

}


export {ContainerAutohide};
export default ContainerAutohide;

Elements.elements.ContainerAutohide = ContainerAutohide;

Elements.load(ContainerAutohide, 'elements-container-autohide');
