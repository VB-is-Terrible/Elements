const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {CustomComposedEvent, removeChildren} from '../../elements_helper.js'

Elements.get(...recommends);
await Elements.get(...requires);

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
	#title: HTMLDivElement;
	#body: HTMLDivElement;
	#buttons: HTMLDivElement;
	#divider: HTMLHRElement;
	#data: ToastData | undefined;
	#closed: boolean = false;
	#timer: ReturnType<typeof setTimeout> = -1;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this.#title = template.querySelector('#title') as HTMLDivElement;
		this.#body = template.querySelector('#body') as HTMLDivElement;
		this.#buttons = template.querySelector('#buttons') as HTMLDivElement;
		this.#divider = template.querySelector('hr') as HTMLHRElement;
		const close = template.querySelector('#close') as HTMLButtonElement;

		close.addEventListener('click', () => {
			this.close();
		});
		//Fancy code goes here
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return [];
	}
	setTitle(title: string) {
		if (title === undefined) {
			throw new Error('Cannot unset title');
		}
		if (this.#data === undefined) {
			this.#data = {
				title: title
			};
		} else {
			this.#data.title = title;
		}
		this.#setTitle(title);
	}
	setBody(body: string | undefined) {
		if (this.#data === undefined) {
			throw new Error("Can't set properties of a toast without a title");
		}
		this.#data.body = body;
		if (body !== undefined) {
			this.#setBody(body);
		} else {
			this.#setBody('');
		}
		const hasContent = this.#data.body === undefined && this.#data.buttons === undefined;
		this.#hideDivider(hasContent);
	}
	setButtons(buttons: Array<string> | undefined) {
		if (this.#data === undefined) {
			throw new Error("Can't set properties of a toast without a title");
		}
		this.#data.buttons = buttons;
		if (buttons !== undefined) {
			this.#setButtons(buttons);
		} else {
			this.#setButtons([]);
		}
		const hasContent = this.#data.body === undefined && this.#data.buttons === undefined;
		this.#hideDivider(hasContent);
	}
	#setTitle(title: string) {
		requestAnimationFrame(() => {
			this.#title.textContent = title;
		});
	}
	#setBody(body: string) {
		requestAnimationFrame(() => {
			this.#body.textContent = body;
		});
	}
	#setButtons(button_text: Array<string>) {
		removeChildren(this.#buttons);
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
				this.#buttons.append(button);
			});
		}
	}
	#hideButtons(hidden: boolean) {
		requestAnimationFrame(() => {
			this.#buttons.style.display = hidden ? 'none' : 'block';
		});
	}
	#hideBody(hidden: boolean) {
		requestAnimationFrame(() => {
			this.#body.style.display = hidden ? 'none' : 'block';
		});
	}
	#hideDivider(hidden: boolean) {
		requestAnimationFrame(() => {
			this.#divider.style.display = hidden ? 'none' : 'block';
		});
	}
	setTimeout(time: number | undefined) {
		if (this.#data === undefined) {
			throw new Error("Can't set properties of a toast without a title");
		}
		this.#data.timeout = time;
		if (time === undefined) {
			clearTimeout(this.#timer);
		} else {
			this.#setTimer(time);
		}
	}
	#setTimer(time: number) {
		clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.close();
		}, time);
	}
	setToast(data: ToastData) {
		this.#data = data;
		this.#setTitle(data.title);
		if (data.body !== undefined) {
			this.#hideBody(false)
			this.#setBody(data.body);
		} else {
			this.#hideBody(true)
			this.#setBody('');
		}
		if (data.buttons !== undefined) {
			this.#setButtons(data.buttons);
			this.#hideButtons(false);
		} else {
			this.#setButtons([]);
			this.#hideButtons(true);
		}
		if (data.body === undefined && data.buttons === undefined) {
			this.#hideDivider(true);
		} else {
			this.#hideDivider(false);
		}
		if (data.timeout !== undefined) {
			this.#setTimer(data.timeout);
		} else {
			clearTimeout(this.#timer);
		}
	}
	close() {
		const ev = CustomComposedEvent('toast_close', undefined, true);
		const not_canceled = this.dispatchEvent(ev);
		if (not_canceled) {
			this.#closed = true;
			const ev2 = new CustomEvent('toast_close_final');
			this.dispatchEvent(ev2);
		}
	}
	get closed() {
		return this.#closed;
	}
	private static createButton(text: string) {
		const button = document.createElement('button');
		button.className = 'notification_button';
		button.textContent = text;
		return button;
	}
}

export default ToasterToast;

Elements.load(ToasterToast, 'elements-toaster-toast');
