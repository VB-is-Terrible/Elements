const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {applyPriorProperties} from '../../elements_helper.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'ContainerAutohide';

const get_animation_duration = () => {
	const num = Elements.animation.LONG_DURATION / 1000;
	return num.toString() + 's';
}

/**
 * [ContainerAutohide Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class ContainerAutohide extends backbone4 {
	_show_offset = '.75em';
	_expander: HTMLDivElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._expander = template.querySelector('#expander') as HTMLDivElement;
		requestAnimationFrame(() => {
			this._expander.style.transitionDuration = get_animation_duration();
		});
		//Fancy code goes here
		shadow.appendChild(template);
		applyPriorProperties(this, 'show_offset')
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
	static get observedAttributes() {
		return ['show_offset'];
	}

}


export {ContainerAutohide};
export default ContainerAutohide;

Elements.elements.ContainerAutohide = ContainerAutohide;

Elements.load(ContainerAutohide, 'elements-container-autohide');
