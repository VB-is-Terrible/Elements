export const recommends = [];
export const requires = ['toaster-toast'];

import {Elements} from '../elements_core.js';
import {backbone4} from '../elements_backbone.js';
import {} from '../elements_helper.js'
import type {ToastData, ToasterToast} from 'toast/toast.js';

const ELEMENT_NAME = 'Toaster';
/**
 * [Toaster Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Toaster extends backbone4 {
	_body: HTMLDivElement;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		this._body = template.querySelector('#pseudoBody') as HTMLDivElement;
		//Fancy code goes here
		shadow.appendChild(template);
		this.addToast({
			title: '0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789',
			body: 'Body text here',
			buttons: ['Hello', 'Big World'],
		});
		this.addToast({
			title: '0123456789 0123456789 0123456789 0123456789 0123456789 0123456789 0123456789',
			body: 'Body text here',
			buttons: ['Hello', 'Big World'],
		});
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
	addToast(toastData: ToastData) {
		const toast = document.createElement('elements-toaster-toast') as ToasterToast;
		toast.setToast(toastData);
		const parent = document.createElement('div');
		const spacer = document.createElement('div');
		spacer.className = 'spacer';
		parent.append(spacer);
		parent.append(toast);
		toast.addEventListener('toast_close', () => {
			parent.remove();
		});
		this._body.append(parent);
		return toast;
	}
}

export default Toaster;

Elements.elements.Toaster = Toaster;

Elements.load(Toaster, 'elements-toaster');
