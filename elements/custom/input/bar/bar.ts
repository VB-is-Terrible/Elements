const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4, applyPriorProperties} from '../../../elements_backbone.js';
import {} from '../../../elements_helper.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'CustomInputBar';


/**
 * [CustomInputBar Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class CustomInputBar extends backbone4 {
	_button_text = '';
	_type = 'text';
	_input: HTMLInputElement;
	_button: HTMLButtonElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		//Fancy code goes here
		this._button = template.querySelector('#bar_button') as HTMLButtonElement;
		this._input = template.querySelector('#bar_input') as HTMLInputElement;
		this._button.addEventListener('click', () => {this._accept();});
		this._input.addEventListener('keypress', (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				this._accept();
			}
		});
		shadow.appendChild(template);
		applyPriorProperties(this, ...CustomInputBar.observedAttributes);
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
			this._button.textContent = value;
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
	static get observedAttributes (): Array<string & keyof CustomInputBar> {
		return ['text', 'type'];
	}
	focus() {
		this._input.focus();
	}
	blur() {
		this._button.blur();
		this._input.blur();
	}
}

export default CustomInputBar;

Elements.load(CustomInputBar, 'elements-custom-input-bar');
