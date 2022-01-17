const recommends: Array<string> = [];
const requires: Array<string> = [];

import { applyPriorProperties, setUpAttrPropertyLink } from '../../elements_backbone.js';
import {Elements} from '../../elements_core.js';
import { booleaner } from '../../elements_helper.js';
import { get_setting } from '../../elements_options.js';
import { AnimationDirection, horizontal, vertical, Direction_Horizontal, Direction_Vertical } from '../direction/direction.js';

Elements.get(...recommends);
await Elements.get(...requires);

const HORIZONTAL_MAP = new Map([
	[Direction_Horizontal.off, ''],
	[Direction_Horizontal.left, 'left'],
	[Direction_Horizontal.right, 'right']
]);

const VERTICAL_MAP = new Map([
	[Direction_Vertical.off, ''],
	[Direction_Vertical.down, 'bottom'],
	[Direction_Vertical.up, 'top'],
]);


const ELEMENT_NAME = 'AnimationSidepanel';
/**
 * [AnimationSidepanel Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class AnimationSidepanel extends AnimationDirection {
	#toggled: boolean = false;
	#animation_main!: Animation;
	#animation_title!: Animation;
	#translator: HTMLDivElement;
	#title: HTMLDivElement;
	#title_slot: HTMLSlotElement;
	#keyframe_main!: KeyframeEffect;
	#keyframe_title!: KeyframeEffect;
	#ro;
	sidebar!: 'horizontal' | 'vertical';
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		this.#translator = template.querySelector('div.slotcontainer') as HTMLDivElement;
		this.#title = template.querySelector('div.toggle') as HTMLDivElement;
		this.#title_slot = template.querySelector('div.toggle slot') as HTMLSlotElement;
		this.#ro = new ResizeObserver((resizeList: ResizeObserverEntry[]) => {
			const box = (resizeList[resizeList.length - 1]).borderBoxSize[0];
			this.#title.style.setProperty('--popupHeight', `${-(box.blockSize + 1)}px`);
			this.#title.style.setProperty('--popupWidth', `${-(box.inlineSize + 1)}px`);
			this.#generateAnimations();
		});
		this.#ro.observe(this.#translator);
		this.#generateAnimations();
		//Fancy code goes here
		shadow.appendChild(template);
		this.style.setProperty('--animation_duration_long', get_setting<number>('long_duration').toString() + 'ms');
		if (this.constructor === AnimationSidepanel) {
			this._post_init();
		}
		applyPriorProperties(this, 'toggled');
		setUpAttrPropertyLink(this, 'sidebar', 'horizontal', () => {
			this.#generateAnimations();
		}, (value: string, oldValue: 'horizontal' | 'vertical') => {
			if (value === 'horizontal') {
				return value;
			} else if (value === 'vertical') {
				return value;
			} else {
				return oldValue;
			}
		});
	}
	get toggled(): boolean {
		return this.#toggled;
	}
	set toggled(value: boolean | string) {
		const filtered = booleaner(value);
		if (filtered !== this.#toggled) {
			this.toggle();
		}
	}
	#generateAnimations() {
		this.#keyframe_main = new KeyframeEffect(this.#translator, [
			{'transform': 'scale(1, 1)'},
			{'transform': `scale(${1 - Math.abs(this[horizontal])}, ${1 - Math.abs(this[vertical])})`},
			// {'transform': 'scale(0, 0)'},
		], {
			// fill: 'forwards',
			duration: get_setting<number>('long_duration'),
		});
		this.#keyframe_title = new KeyframeEffect(this.#title, [
			{'transform': 'translateY(var(--popupHeight))'},
			{'transform': 'translateY(0)'},
		], {
			// fill: 'forwards',
			duration: get_setting<number>('long_duration'),
		});
		requestAnimationFrame(() => {
			this.#translator.style.transformOrigin = `${HORIZONTAL_MAP.get(this[horizontal])} ${VERTICAL_MAP.get(this[vertical])}`;
		});
	}
	#regenerateAnimations() {
		this.#animation_main = new Animation(this.#keyframe_main);
		this.#animation_title = new Animation(this.#keyframe_title);

		this.#animation_title.addEventListener('remove', (e: Event) => {
			console.log(`Fuck2! ${e.timeStamp}`);
		});
		this.#animation_main.addEventListener('remove', (e) => {
			console.log(`Fuck1! ${e.timeStamp}`);
		});
		this.#animation_title.addEventListener('finish', (e: Event) => {
			this.#animation_title.commitStyles();
		});
		this.#animation_main.addEventListener('finish', (e) => {
			console.log(`Yay1! ${e.timeStamp}`);

			// this.#animation_main.commitStyles();
		});

		this.#animation_main.pause();
		this.#animation_title.pause();
		if (!this.#toggled) {
			this.#animation_main.reverse();
			this.#animation_title.reverse();
		}
		this.#animation_title.persist();
		this.#animation_main.persist();
		this.#animation_title.finish();
		this.#animation_main.finish();
		// this.#animation_title.commitStyles();
		// this.#animation_main.commitStyles();
	}
	toggle() {
		this.#regenerateAnimations()
		this.#animation_main.reverse();
		this.#animation_title.reverse();
		this.#animation_title.persist();
		this.#animation_main.persist();
		if (!this.attributeInit) {
			this.#animation_main.finish();
			this.#animation_title.finish();
		}
		this.#toggled = !this.#toggled;
		if (this.attributeInit) {
			const toggled_str = String(this.#toggled);
			this.setAttribute('toggled', toggled_str);
			for (const child of this.#title_slot.assignedElements()) {
				child.setAttribute('toggled', toggled_str);
			}
		}
	}
	get animations() {
		return [this.#animation_main, this.#animation_title];
	}
	regen() {
		this.#generateAnimations();
	}
	protected direction_change() {
		this.#generateAnimations();
	};
	static get observedAttributes() {
		return ['vertical', 'horizontal', 'toggled', 'sidebar'];
	}
}

export default AnimationSidepanel;

Elements.load(AnimationSidepanel, 'elements-animation-sidepanel');
