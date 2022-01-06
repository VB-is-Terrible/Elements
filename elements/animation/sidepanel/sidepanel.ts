const recommends: Array<string> = [];
const requires: Array<string> = [];

import { applyPriorProperties } from '../../elements_backbone.js';
import {Elements} from '../../elements_core.js';
import { booleaner } from '../../elements_helper.js';
import { get_setting } from '../../elements_options.js';
import { AnimationDirection, horizontal, vertical } from '../direction/direction.js';

Elements.get(...recommends);
await Elements.get(...requires);

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
	#ro;
	protected direction_change = () => {};
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
		});
		this.#ro.observe(this.#translator);
		this.#generateAnimations();
		//Fancy code goes here
		shadow.appendChild(template);
		if (this.constructor === AnimationSidepanel) {
			this._post_init();
		}
		applyPriorProperties(this, 'toggled');
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
		const frames_main = new KeyframeEffect(this.#translator, [
			{'transform': 'scaleY(1)'},
			{'transform': `scaleY(0)`},
		], {
			fill: 'forwards',
			duration: get_setting<number>('long_duration'),
		});
		this.#animation_main = new Animation(frames_main);
		const frames_title = new KeyframeEffect(this.#title, [
			{'transform': 'translateY(var(--popupHeight))'},
			{'transform': 'translateY(0)'},
		], {
			fill: 'forwards',
			duration: get_setting<number>('long_duration'),
		});
		this.#animation_title = new Animation(frames_title);
		this.#animation_main.pause();
		this.#animation_title.pause();
		if (!this.#toggled) {
			this.#animation_main.reverse();
			this.#animation_title.reverse();
		}
		// this.#animation_title.persist();
		// this.#animation_main.persist();
		this.#animation_title.finish();
		this.#animation_main.finish();

	}
	toggle() {
		this.#animation_main.reverse();
		this.#animation_title.reverse();
		if (!this.attributeInit) {
			// this.#animation_title.persist();
			// this.#animation_main.persist();
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
}

export default AnimationSidepanel;

Elements.load(AnimationSidepanel, 'elements-animation-sidepanel');
