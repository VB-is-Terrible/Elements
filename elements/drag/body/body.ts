export const recommends = ['drag-body'];
export const requires = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {} from '../../elements_helper.js';
import type {DragElement} from '../element/element.js';
const ELEMENT_NAME = 'DragBody';
type MouseListener = (arg0: MouseEvent) => void;




/**
 * Interface for parents of drag-elements
 * @interface DragParent
 */
/**
 * @property {HTMLElement} subject
 * @description drag-element been dragged. This should be forwarded to a drag-body
 * @name DragParent.subject
 */
/**
 * @function topZIndex
 * @param {Node} childNode Node to raise
 * @description Raise a drag element above other drag-elements
 * @name DragParent.topZIndex
 */
/**
 * @function toBottom
 * @description Push the drag-body to the bottom. Used after a drag to allow access to other elements
 * @name DragParent.toBottom
 */
/**
 * @function toTop
 * @param {Node} childNode Node to place ontop of other nodes
 * @description Push childNode and dragBody to the top of z-Indexes
 * @name DragParent.toTop
 */

/**
 * DragBody
 * Designed to hold DragElements
 * Make sure internal elements are also draggable
 * @property {HTMLElement} subject drag-element been dragged
 * @implements DragParent
 * @augments Elements.elements.backbone4
 */
export class DragBody extends backbone4 {
        zIndexCount: number;
        private _body: HTMLDivElement;
        callbacks: { move: MouseListener; end: MouseListener; };
        subject: null | DragElement;
	constructor () {
		super();

		const self = this;
		this.subject = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(ELEMENT_NAME);
                this._body = template.querySelector('#pseudoBody') as HTMLDivElement;
		this.zIndexCount = parseInt(this._body.style.zIndex) || 0;
		/**
		 * Wrapped event handlers.
		 * Used to mantian consistent calls to add/remove-EventListener
		 * @type {Object}
		 * @private
		 */
		this.callbacks = {
			move: (e) => {self.drag_move(e)},
			end: (e) => {self.drag_end(e)},
		};
                this._body.addEventListener('elements-drag-top', (e) => {
                        const ev = e as CustomEvent;
                        const child = ev.detail as DragElement;
                        this.subject = child;
                        this.toTop(child);
                        e.stopPropagation();
                });
                this._body.addEventListener('elements-drag-bottom', (e) => {
                        this.toBottom();
                        e.stopPropagation();
                });
                this._body.addEventListener('elements-drag-topZIndex', (e) => {
                        const ev = e as CustomEvent;
                        const child = ev.detail as DragElement;
                        this.topZIndex(child);
                        e.stopPropagation();
                });
		shadow.appendChild(template);
	}
	/**
	 * Updates a mouse based drag
	 * @param  {MouseEvent} event
	 * @private
	 */
	drag_move (event: MouseEvent) {
		let target = this.subject;
                if (target !== null) {
                        target.drag_move(event);
                }
	}
	/**
 	 * Ends a mouse based drag
 	 * @param  {MouseEvent} event
 	 * @private
 	 */
	drag_end (event: MouseEvent) {
		let target = this.subject;
                if (target !== null) {
                        target.drag_end(event);
                }
	}
	/**
	 * Push childNode and dragBody to the top of z-Indexes
	 * @param  {Node} childNode Node to place ontop of other nodes
	 */
	toTop (childNode: DragElement) {
		// Place childNode on top of other floating elements
		this.topZIndex(childNode);
		// Place pseudoBody on top of everything else
		let body = this._body;
		requestAnimationFrame(() => {
			body.style.width = '100%';
			body.style.height = '100%';
		});
		body.addEventListener('mousemove', this.callbacks.move);
		body.addEventListener('mouseup', this.callbacks.end);

	}
	/**
	 * Push the drag-body to the bottom.
	 * Used after a drag to allow access to other elements
	 */
	toBottom () {
		// Place pseudoBody out of the way
		// The high z-index is needed to keep child elements on top
		let body = this._body;
		requestAnimationFrame(() => {
			body.style.width = '0px';
			body.style.height = '0px';
		});
		body.removeEventListener('mousemove', this.callbacks.move);
		body.removeEventListener('mouseup', this.callbacks.end);
	}
	/**
	 * Raise a drag element above other drag elements
	 * @param  {Node} childNode Node to raise
	 */
	topZIndex (childNode: DragElement) {
		this.zIndexCount += 1;
		requestAnimationFrame(() => {
			childNode.style.zIndex = this.zIndexCount.toString();
		});
	}
};

export default DragBody;

Elements.elements.DragBody = DragBody;

Elements.load(DragBody, 'elements-drag-body');
