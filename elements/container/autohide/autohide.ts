const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, setUpAttrPropertyLink} from '../../elements_backbone.js';
import {} from '../../elements_helper.js';

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
export class ContainerAutohide extends backbone4 {
	show_offset!: string;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		const padding = template.querySelector('div.padding') as HTMLDivElement;
		// this._expander = template.querySelector('#expander') as HTMLDivElement;
		requestAnimationFrame(() => {
			const animation_duration = get_animation_duration();
			this.style.transitionDuration = animation_duration;
			padding.style.transitionDuration = animation_duration;
		});

		//Fancy code goes here
		shadow.appendChild(template);
		setUpAttrPropertyLink(this, 'show_offset', '1em', (offset: string) => {
			requestAnimationFrame(() => {
				this.style.transform = `translate(0, calc(-100% + ${offset}))`;
			});
		});
	}
	static get observedAttributes() {
		return ['show_offset'];
	}

}


export default ContainerAutohide;

Elements.load(ContainerAutohide, 'elements-container-autohide');
