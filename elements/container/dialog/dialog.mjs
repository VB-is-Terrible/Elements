export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

// const animation_states = Object.freeze({
// 	none: 0,
// 	forwards: 1,
// 	backwards: 2,
// });

const get_options = (hidden) => {
	return {
		fill: 'forwards',
		duration : Elements.animation.MEDIUM_DURATION,
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
			transform:'translate(0, ' + Elements.animation.DROP_AMOUNT.toString() + 'px)',
			opacity: 0,
		},
	]
};

/**
 * [ContainerDialog Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class ContainerDialog extends Elements.elements.backbone3 {
	_animation = null;
	_animation_state = false;
	_hidden = false;
	_body;
	_ready = false;
	constructor() {
		super();

		this.name = 'ContainerDialog';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);
		this._body = template.querySelector('#animationBody');
		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperty('hidden', false);
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
		_set_hidden(true);
	}
	show() {
		_set_hidden(false);
	}
	get dialog_hidden() {
		return this._hidden;
	}
	set dialog_hidden(value) {
		const real_value = Elements.booleaner(value);
		if (real_value === this._hidden) {return;}
		this._set_hidden(real_value);
		if (this.attributeInit) {
			this.setAttribute('dialog_hidden', real_value);
		}
	}
	_set_hidden(value) {
		if (this._hidden === value) {return;}
		if (!this.ready) {
			if (value) {
				this._body.style.display = 'none';
			} else {
				this._body.style.display = 'block';
			}
			this._hidden = value;
			return;
		} else {

		}
		if (this._animation_state === true) {
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
	}
	_post_animation() {
		this._animation = null;
		this._animation_state = false;
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

export {ContainerDialog};
export default ContainerDialog;

Elements.elements.ContainerDialog = ContainerDialog;

Elements.load(ContainerDialog, 'elements-container-dialog');
