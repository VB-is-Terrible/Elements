const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, applyPriorProperty} from '../../elements_backbone.js';
import {booleaner} from '../../elements_helper.js';
import { get_setting } from '../../elements_options.js';

Elements.get(...recommends);
await Elements.get(...requires);

// const animation_states = Object.freeze({
// 	none: 0,
// 	forwards: 1,
// 	backwards: 2,
// });

const ELEMENT_NAME = 'ContainerDialog';


const get_options = (hidden: boolean): KeyframeAnimationOptions => {
	return {
		fill: 'forwards',
		duration : get_setting<number>('medium_duration'),
		direction: hidden ? 'normal' : 'reverse',
	};
};

const get_states = () => {
	return [
		{
			transform: 'translate(0, 0)',
			opacity: 1
		},
		{
			transform:'translate(0, ' + get_setting<string>('drop_amount') + ')',
			opacity: 0,
		},
	]
};

/**
 * [ContainerDialog Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class ContainerDialog extends backbone4 {
	private _animation: null | Animation = null;
	private _hidden = false;
	private _body: HTMLElement;
	private _ready = false;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._body = template.querySelector('#animationBody') as HTMLElement;
		//Fancy code goes here
		shadow.appendChild(template);
		applyPriorProperty(this, 'hidden', false);
		this.addEventListener('dialog_close', (e) => {
			this.hide();
			e.stopPropagation();
		});
		this._body.addEventListener('keyup', (e) => {
			if (e.key === 'Escape') {
				this.hide();
				e.stopPropagation();
			}
		});
	}
	connectedCallback() {
		super.connectedCallback();
		this._ready = true;
	}
	disconnectedCallback() {
		super.disconnectedCallback();
		this._ready = false;
	}
	hide() {
		this._set_hidden(true);
	}
	show() {
		this._set_hidden(false);
	}
	toggle() {
		this._set_hidden(!this._hidden);
	}
	get dialog_hidden() {
		return this._hidden;
	}
	set dialog_hidden(value) {
		const real_value = booleaner(value);
		if (real_value === this._hidden) {return;}
		this._set_hidden(real_value);
	}
	private _set_hidden(value: boolean) {
		if (this._hidden === value) {return;}
		if (!this._ready) {
			if (value) {
				this._body.style.display = 'none';
			} else {
				this._body.style.display = 'block';
			}
			this._hidden = value;
			return;
		} else {

		}
		if (this._animation !== null) {
			this._animation.reverse();
		} else {
			if (this._hidden) {
				requestAnimationFrame(() => {
					this._body.style.display = 'block';
				});
			}
			this._animation = this._body.animate(
				get_states(),
				get_options(value),
			);
			this._animation.onfinish = () => {
				this._post_animation();
			}
		}
		this._hidden = value;

		if (this.attributeInit) {
			this.setAttribute('dialog_hidden', value.toString());
		}
	}
	private _post_animation() {
		this._animation = null;
		if (this._hidden) {
			requestAnimationFrame(() => {
				this._body.style.display = 'none';
			});
		}
	}
	static get observedAttributes() {
		return ['dialog_hidden'];
	}
}

export default ContainerDialog;

Elements.load(ContainerDialog, 'elements-container-dialog');
