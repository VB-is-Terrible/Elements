export const recommends = [];
export const requires = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {CustomComposedEvent, removeChildren} from '../../elements_helper.js'


export type ToastData = {
	title: string;
	body? : string;
	buttons? : Array<string>;
	timeout? : number; // In ms
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
	private _data: ToastData | undefined;
	private _closed: boolean = false;
	private _timer: ReturnType<typeof setTimeout> = -1;
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
	setTitle(title: string) {
		if (title === undefined) {
			throw new Error('Cannot unset title');
		}
		if (this._data === undefined) {
			this._data = {
				title: title
			};
		} else {
			this._data.title = title;
		}
		this._setTitle(title);
	}
	setBody(body: string | undefined) {
		if (this._data === undefined) {
			throw new Error("Can't set properties of a toast without a title");
		}
		this._data.body = body;
		if (body !== undefined) {
			this._setBody(body);
		} else {
			this._setBody('');
		}
		const hasContent = this._data.body === undefined && this._data.buttons === undefined;
		this._hideDivider(hasContent);
	}
	setButtons(buttons: Array<string> | undefined) {
		if (this._data === undefined) {
			throw new Error("Can't set properties of a toast without a title");
		}
		this._data.buttons = buttons;
		if (buttons !== undefined) {
			this._setButtons(buttons);
		} else {
			this._setButtons([]);
		}
		const hasContent = this._data.body === undefined && this._data.buttons === undefined;
		this._hideDivider(hasContent);
	}
	private _setTitle(title: string) {
		requestAnimationFrame(() => {
			this._title.innerHTML = title;
		});
	}
	private _setBody(body: string) {
		requestAnimationFrame(() => {
			this._body.innerHTML = body;
		});
	}
	private _setButtons(button_text: Array<string>) {
		removeChildren(this._buttons);
		for (const [index, text] of button_text.entries()) {
			const button = ToasterToast.createButton(text);
			button.addEventListener('click', () => {
				const ev = CustomComposedEvent('toast_button_click', index);
				const not_canceled = this.dispatchEvent(ev);
				if (not_canceled) {
					this.close();
				}
			});
			requestAnimationFrame(() => {
				this._buttons.append(button);
			});
		}
	}
	private _hideButtons(hidden: boolean) {
		requestAnimationFrame(() => {
			this._buttons.style.display = hidden ? 'none' : 'block';
		});
	}
	private _hideBody(hidden: boolean) {
		requestAnimationFrame(() => {
			this._body.style.display = hidden ? 'none' : 'block';
		});
	}
	private _hideDivider(hidden: boolean) {
		requestAnimationFrame(() => {
			this._divider.style.display = hidden ? 'none' : 'block';
		});
	}
	setTimeout(time: number | undefined) {
		if (this._data === undefined) {
			throw new Error("Can't set properties of a toast without a title");
		}
		this._data.timeout = time;
		if (time === undefined) {
			clearTimeout(this._timer);
		} else {
			this._setTimer(time);
		}
	}
	private _setTimer(time: number) {
		clearTimeout(this._timer);
		this._timer = setTimeout(() => {
			this.close();
		}, time);
	}
	setToast(data: ToastData) {
		this._data = data;
		this._setTitle(data.title);
		if (data.body !== undefined) {
			this._hideBody(false)
			this._setBody(data.body);
		} else {
			this._hideBody(true)
			this._setBody('');
		}
		if (data.buttons !== undefined) {
			this._setButtons(data.buttons);
			this._hideButtons(false);
		} else {
			this._setButtons([]);
			this._hideButtons(true);
		}
		if (data.body === undefined && data.buttons === undefined) {
			this._hideDivider(true);
		} else {
			this._hideDivider(false);
		}
		if (data.timeout !== undefined) {
			this._setTimer(data.timeout);
		} else {
			clearTimeout(this._timer);
		}
	}
	close() {
		const ev = CustomComposedEvent('toast_close', undefined, true);
		const not_canceled = this.dispatchEvent(ev);
		if (not_canceled) {
			this._closed = true;
			const ev2 = new CustomEvent('toast_close_final');
			this.dispatchEvent(ev2);
		}
	}
	get closed() {
		return this._closed;
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
