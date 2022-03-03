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

type Styles = Partial<CSSStyleDeclaration>;

const applyStyles = (element: HTMLElement, styles: Styles) => {
	requestAnimationFrame(() => {
		for (const prop in styles) {
			element.style[prop] = styles[prop] as string;
		}
	});
}

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
	#popupHeight = 0;
	#popupWidth = 0;
	sidebar!: 'horizontal' | 'vertical' | 'auto';
	align!: 'begin' | 'end';
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		this.#translator = template.querySelector('div.slotcontainer') as HTMLDivElement;
		this.#title = template.querySelector('div.toggle') as HTMLDivElement;
		this.#title_slot = template.querySelector('div.toggle slot') as HTMLSlotElement;
		const spacer = template.querySelector('div.spacer') as HTMLDivElement;
		this.#ro = new ResizeObserver((resizeList: ResizeObserverEntry[]) => {
			const box = (resizeList[resizeList.length - 1]).borderBoxSize[0];
			this.#title.style.setProperty('--popupHeight', `${-(box.blockSize + 1)}px`);
			this.#title.style.setProperty('--popupWidth', `${-(box.inlineSize + 1)}px`);
			this.#popupHeight = box.blockSize;
			this.#popupWidth = box.inlineSize;
			this.#commitMainStyles();
			this.#commitTitleStyles();
			requestAnimationFrame(() => {
				spacer.style.height = `${box.blockSize}px`;
				console.log('fuck');
			});
		});
		this.#ro.observe(this.#translator);
		//Fancy code goes here
		shadow.appendChild(template);
		this.style.setProperty('--animation_duration_long', get_setting<number>('long_duration').toString() + 'ms');
		if (this.constructor === AnimationSidepanel) {
			this._post_init();
		}
		applyPriorProperties(this, 'toggled');
		setUpAttrPropertyLink(this, 'sidebar', 'auto', () => {
			this.#commitMainStyles();
			this.#commitTitleStyles();
		}, (value: string, oldValue: 'horizontal' | 'vertical' | 'auto') => {
			if (value === 'horizontal') {
				return value;
			} else if (value === 'vertical') {
				return value;
			} else if (value === 'auto') {
				return value;
			} else {
				return oldValue;
			}
		});
		setUpAttrPropertyLink(this, 'align', 'begin', () => {
			this.#commitMainStyles();
			this.#commitTitleStyles();
		}, (value: string, oldValue: typeof this.align) => {
			if (value === 'begin') {
				return value;
			} else if (value === 'end') {
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
		], {
			duration: get_setting<number>('long_duration'),
			direction: this.#toggled ? 'reverse' : 'normal',
		});
		this.#keyframe_title = new KeyframeEffect(this.#title, [
			{'transform': this.titleStyles(false).transform},
			{'transform': this.titleStyles(true).transform},
		], {
			duration: get_setting<number>('long_duration'),
			direction: this.#toggled ? 'reverse' : 'normal',
		});
		requestAnimationFrame(() => {
			this.#translator.style.transformOrigin = `${HORIZONTAL_MAP.get(this[horizontal])} ${VERTICAL_MAP.get(this[vertical])}`;
		});
	}
	#regenerateAnimations() {
		this.#animation_main = new Animation(this.#keyframe_main);
		this.#animation_title = new Animation(this.#keyframe_title);

		this.#animation_title.addEventListener('finish', () => {
			this.#commitTitleStyles();
		});
		this.#animation_main.addEventListener('finish', () => {
			this.#commitMainStyles();
		});

		this.#animation_main.pause();
		this.#animation_title.pause();
	}
	#commitMainStyles() {
		requestAnimationFrame(() => {
			this.#translator.style.transform = this.#toggled ? `scale(${1 - Math.abs(this[horizontal])}, ${1 - Math.abs(this[vertical])})` : 'scale(1, 1)';
		});
	}
	#commitTitleStyles() {
		applyStyles(this.#title, this.titleStyles(this.#toggled));

	}
	testUpdate() {
		applyStyles(this.#title, this.titleStyles(this.#toggled));
	}
	titleStyles(toggled: boolean): Styles {
		const base = {
			'left': 'unset',
			'right': 'unset',
			'bottom': 'unset',
			'top': 'unset',
			'transform': `translateY(${-this.#popupHeight}px)`
		};
		const horizontal_v = this[horizontal];
		const vertical_v = this[vertical];
		let sidebar = this.sidebar;
		if (sidebar === 'auto') {
			if (vertical_v !== Direction_Vertical.off) {
				sidebar = 'vertical';
			} else if (horizontal_v !== Direction_Horizontal.off) {
				sidebar = 'horizontal';
			} else {
				sidebar = 'vertical';
			}
		}
		if (sidebar === 'vertical') {
			if (this.align === 'begin') {
				base.left = '0';
			} else {
				base.right = '0';
			}
			if (vertical_v === Direction_Vertical.off) {
				base.bottom = '0';
				base.transform = 'translateY(0)';
			} else if (vertical_v === Direction_Vertical.down) {
				base.bottom = '0';
				if (toggled) {
					base.transform = `translateY(${this.#popupHeight}px)`;
				} else {
					base.transform = 'translateY(0)';
				}
			} else {
				base.top = '0';
				if (toggled) {
					base.transform = 'translateY(0)';
				} else {
					base.transform = `translateY(${this.#popupHeight}px)`;
				}
			}
		} else {
			if (this.align === 'begin') {
				base.top = '0';
			} else {
				// base.bottom = `-${this.#popupHeight}`;
				base.bottom = `-${this.#popupHeight}px`;
			}
			if (horizontal_v === Direction_Horizontal.off) {
				base.left = '0';
				base.transform = `translateX(${this.#popupWidth}px)`;
			} else if (horizontal_v === Direction_Horizontal.left) {
				base.left = '0';
				if (toggled) {
					base.transform = 'translateX(0)';
				} else {
					base.transform = `translateX(${this.#popupWidth}px)`;
				}
			} else {
				base.right = '0'
				if (toggled) {
					base.transform = 'translateX(0)';
				} else {
					base.transform = `translateX(${-this.#popupWidth}px)`;
				}
			}
		}
		return base;
	}
	toggle() {
		this.#generateAnimations()
		this.#regenerateAnimations()
		this.#animation_main.play();
		this.#animation_title.play();
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
		this.#commitMainStyles();
		this.#commitTitleStyles();
	};
	static get observedAttributes() {
		return ['vertical', 'horizontal', 'toggled', 'sidebar', 'align'];
	}
}

export default AnimationSidepanel;

Elements.load(AnimationSidepanel, 'elements-animation-sidepanel');
