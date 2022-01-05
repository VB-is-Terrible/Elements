const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {} from '../../elements_helper.js';
import { AnimationDirection } from '../direction/direction.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'AnimationSidepanel';
/**
 * [AnimationSidepanel Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class AnimationSidepanel extends AnimationDirection {
	protected direction_change = () => {};
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		//Fancy code goes here
		shadow.appendChild(template);
	}

}

export default AnimationSidepanel;

Elements.load(AnimationSidepanel, 'elements-animation-sidepanel');
