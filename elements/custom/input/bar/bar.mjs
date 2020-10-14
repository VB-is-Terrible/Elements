export const recommends = [];
export const requires = [];

import {Elements} from '../../../Elements.mjs';

/**
 * [CustomInputBar Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class CustomInputBar extends Elements.elements.backbone3 {
	_button_text = '';
	_type = 'text';
	_input;
	_button;
	constructor() {
		super();

		this.name = 'CustomInputBar';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);
		//Fancy code goes here
		this._button = template.querySelector('#bar_button');
		this._input = template.querySelector('#bar_input');
		this._button.addEventListener('click', () => {this._accept();});
		this._input.addEventListener('keypress', (e) => {
			if (e.key === "Enter") {
				this._accept();
			}
		});
		shadow.appendChild(template);
		this.applyPriorProperties(this.constructor.observedAttributes);
	}
	_accept() {
		const event = new CustomEvent('accept', {detail: this._input.value});
		this.dispatchEvent(event);
	}
	get text() {
		return this._button_text;
	}
	set text(value) {
		if (value === this._button_text) {
			return;
		}

		this._button_text = value;
		requestAnimationFrame(() => {
			this._button.innerHTML = value;
		});

		if (this.attributeInit) {
			this.setAttribute('text', value);
		}
	}
	get type() {
		return this._type;
	}
	set type(value) {
		if (value === this._type) {
			return;
		}

		this._type = value;
		requestAnimationFrame(() => {
			this._input.type = value;
		});

		if (this.attributeInit) {
			this.setAttribute('type', value)
		}
	}
	get value() {
		return this._input.value;
	}
	set value(value) {
		this._input.value = value;
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return ['text', 'type'];
	}
	focus() {
		this._input.focus();
	}

}

export {CustomInputBar};
export default CustomInputBar;

Elements.elements.CustomInputBar = CustomInputBar;

Elements.load(CustomInputBar, 'elements-custom-input-bar');
