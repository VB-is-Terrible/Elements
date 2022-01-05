const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import { get_setting } from '../../elements_options.js';
import { booleaner } from '../../elements_helper.js';
import { AnimationDirection, vertical, horizontal } from '../direction/direction.js';

Elements.get(...recommends);
await Elements.get(...requires);


const ELEMENT_NAME = 'AnimationTranslate';
/**
 * [AnimationTranslate Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class AnimationTranslate extends AnimationDirection {
	#toggled: boolean = false;
	#animation!: Animation;
	#translator: HTMLDivElement;
	#ready = false;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this.#translator = template.querySelector('div.slotcontainer') as HTMLDivElement;

		this.#ready = true;
		this.#generateAnimations();
		shadow.appendChild(template);
		if (this.constructor === AnimationTranslate) {
			this._post_init();
		}
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
	#generateAnimations() {
		if (!this.#ready) {return;}
		const frames = new KeyframeEffect(this.#translator, [
			{'transform':'translate(0px, 0px)'},
			{'transform':`translate(${100*this[horizontal]}%, ${100*this[vertical]}%)`},
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
	protected direction_change() {
		console.log('hi')
		if (this.#ready) {
			this.#generateAnimations();
		}
	}
}

export default AnimationTranslate;

Elements.load(AnimationTranslate, 'elements-animation-translate');
