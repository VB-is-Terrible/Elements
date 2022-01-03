const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, setUpAttrPropertyLink} from '../../elements_backbone.js';
import { get_setting } from '../../elements_options.js';
import { booleaner } from '../../elements_helper.js';

Elements.get(...recommends);
await Elements.get(...requires);

const enum Direction_Vertical {
	off = 0,
	up = -1,
	down = 1,
};

const enum Direction_Horizontal {
	off = 0,
	right = 1,
	left = -1,
};

const ELEMENT_NAME = 'AnimationTranslate';
/**
 * [AnimationTranslate Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class AnimationTranslate extends backbone4 {
	#toggled: boolean = false;
	#vertical: Direction_Vertical = Direction_Vertical.off;
	#horizontal: Direction_Horizontal = Direction_Horizontal.off;
	vertical!: string;
	horizontal!: string;
	// #ro;
	#animation!: Animation;
	#translator: HTMLDivElement;
	#ready = false;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this.#translator = template.querySelector('div.slotcontainer') as HTMLDivElement;

		setUpAttrPropertyLink(this, 'vertical', '', (value: string) => {
			switch (value) {
				case 'up':
					this.#vertical = Direction_Vertical.up;
					break;
				case 'down':
					this.#vertical = Direction_Vertical.down;
					break;
				case '':
				default:
					this.#vertical = Direction_Vertical.off;
			}
			if (this.#ready) {
				this.#generateAnimations();
			}
		});
		setUpAttrPropertyLink(this, 'horizontal', '', (value: string) => {
			switch (value) {
				case 'right':
					this.#horizontal = Direction_Horizontal.right;
					break;
				case 'left':
					this.#horizontal = Direction_Horizontal.left;
					break;
				case '':
				default:
					this.#horizontal = Direction_Horizontal.off;
			}
			if (this.#ready) {
				this.#generateAnimations();
			}
		});
		this.#ready = true;
		this.#generateAnimations();
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return ['vertical', 'horizontal', 'toggled'];
	}
	toggle() {
		this.#animation.reverse();
		if (!this.attributeInit) {
			this.#animation.finish();
		}
		this.#toggled = !this.#toggled;
		if (this.attributeInit) {
			this.setAttribute('toggled', String(this.#toggled));
		}
	}
	get toggled() {
		return this.#toggled;
	}
	set toggled(value: boolean | string) {
		const filtered = booleaner(value);
		if (filtered !== this.#toggled) {
			this.toggle();
		}
	}
	get animation() {
		return this.#animation;
	}
	#generateAnimations() {
		if (!this.#ready) {return;}
		const frames = new KeyframeEffect(this.#translator, [
			{'transform':'translate(0px, 0px)'},
			{'transform':`translate(${100*this.#horizontal}%, ${100*this.#vertical}%)`},
		], {
			fill: 'forwards',
			duration: get_setting<number>('medium_duration'),
		});
		this.#animation = new Animation(frames);
		this.#animation.pause();
		if (!this.#toggled) {
			this.#animation.reverse();
		}
		this.#animation.finish();
	}
}

export default AnimationTranslate;

Elements.load(AnimationTranslate, 'elements-animation-translate');
