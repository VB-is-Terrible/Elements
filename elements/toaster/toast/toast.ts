export const recommends = [];
export const requires = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {removeChildren} from '../../elements_helper.js';


export type ToastData = {
	title: string;
	body? : string;
	buttons? : Array<string>;
};

/**
 * When a button has being clicked on a toast
 * @event Elements.elements.ToasterToast#toast_button_click
 * @property {Number} detail The index of the button clicked
 */
/**
 * Toast close event
 * @event Elements.elements.ToasterToast#toast_close
 */
const ELEMENT_NAME = 'ToasterToast';
/**
 * An individual toast for the toaster
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 * @fires Elements.elements.ToasterToast#toast_button_click
 * @fires Elements.elements.ToasterToast#toast_close
 */
export class ToasterToast extends backbone4 {
	private _title: HTMLDivElement;
	private _body: HTMLDivElement;
	private _buttons: HTMLDivElement;
	private _divider: HTMLHRElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._title = template.querySelector('#title') as HTMLDivElement;
		this._body = template.querySelector('#body') as HTMLDivElement;
		this._buttons = template.querySelector('#buttons') as HTMLDivElement;
		this._divider = template.querySelector('hr') as HTMLHRElement;
		const close = template.querySelector('#close') as HTMLButtonElement;

		close.addEventListener('click', () => {
			this.close();
		});
		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	static get observedAttributes() {
		return [];
	}
	private _setTitle(title: string) {
		this._title.innerHTML = title;
	}
	private _setBody(body: string) {
		this._body.innerHTML = body;
	}
	private _setButtons(button_text: Array<string>) {
		removeChildren(this._buttons);
		for (const [index, text] of button_text.entries()) {
			const button = ToasterToast.createButton(text);
			button.addEventListener('click', () => {
				const ev = new CustomEvent('toast_button_click', {
					bubbles: false,
					cancelable: true,
					detail: index,
				});
				const prevented = this.dispatchEvent(ev);
				if (!prevented) {
					this.close();
				}
			})
			requestAnimationFrame(() => {
				this._buttons.append(button);
			});
		}
	}
	private _hideButtons() {
		requestAnimationFrame(() => {
			this._buttons.style.display = 'none';
		});
	}
	private _hideBody() {
		requestAnimationFrame(() => {
			this._body.style.display = 'none';
		});
	}
	private _hideDivider() {
		requestAnimationFrame(() => {
			this._divider.style.display = 'none';
		});
	}
	setToast(data: ToastData) {
		this._setTitle(data.title);
		if (data.body !== undefined) {
			this._setBody(data.body);
		} else {
			this._hideBody()
		}
		if (data.buttons !== undefined) {
			this._setButtons(data.buttons);
		} else {
			this._hideButtons();
		}
		if (data.body === undefined && data.buttons === undefined) {
			this._hideDivider();
		}
	}
	close() {
		const ev = new CustomEvent('toast_close', {
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(ev);
	}
	private static createButton(text: string) {
		const button = document.createElement('button');
		button.className = 'notification_button';
		button.innerHTML = text;
		return button;
	}
}

export default ToasterToast;

Elements.elements.ToasterToast = ToasterToast;

Elements.load(ToasterToast, 'elements-toaster-toast');
