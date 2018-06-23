'use strict';

Elements.get('drag-element');
{
const main = async () => {

await Elements.get();

// TODO:  Write description
/**
 * [ConfirmDialog description]
 * @type {Object}
 * @augments Elements.elements.backbone2
 * @implements DragParent
 * @property {Function} on_confirm Function to callback on confirmation
 * @property {Function} on_cancel Function to callback on cancellation
 */
Elements.elements.ConfirmDialog = class ConfirmDialog extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'ConfirmDialog';
		/**
		 * Function to callback on confirmation
		 * @type {Function}
		 */
		this.on_confirm = null;
		/**
		 * Function to callback on cancellation
		 * @type {Function}
		 */
		this.on_cancel = null;

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let drag = template.querySelector('#dragBody');
		drag.parent = this;
		/**
		 * The internal drag-element
		 * @type {Elements.elements.DragElement}
		 * @private
		 */
		this.__drag = drag;
		let cancel = template.querySelector('#Cancel');
		let confirm = template.querySelector('#Done');

		cancel.addEventListener('click', (e) => {
			if (self.on_cancel !== null) {
				self.on_cancel();
			}
			self.__reset();
		});
		confirm.addEventListener('click', (e) => {
			if (self.on_confirm !== null) {
				self.on_confirm();
			}
			self.__reset();
		});
		// TODO: attach MutationObserver
		this.mo = new MutationObserver(() => {
			self.__show();
		});
		shadow.appendChild(template);
	}
	/**
	 * Reset listener state
	 * @private
	 */
	__reset () {
		for (let element of this.children) {
			element.remove();
		}
		this.__drag.hideWindow();
		this.on_confirm = null;
		this.on_cancel = null;
	}
	connectedCallback () {
		super.connectedCallback();
	}
	/**
	 * Display the dialog
	 * @private
	 */
	__show () {
		this.__drag.showWindow();
	}
	get parent () {
		return this.parentNode;
	}
	get subject () {
		return this.parent.subject;
	}
	set subject (value) {
		this.parent.subject = value;
	}
	toBottom () {
		this.parent.toBottom();
	}
	topZIndex (childNode) {
		this.parent.topZIndex(childNode);
	}
	toTop (childNode) {
		this.parent.toTop(childNode);
	}

};

Elements.load(Elements.elements.ConfirmDialog, 'elements-confirm_dialog');
};

main();
}
