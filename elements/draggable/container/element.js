'use strict';

Elements.get('draggable-Common');
{
const main = async () => {

await Elements.get('draggable-Common');
/**
 * [DraggableContainer Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.DraggableContainer = class DraggableContainer extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'DraggableContainer';
		this._slot_counter = 0;
		this._context = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let mutation_react = (mutationsList, observer) => {
			for (let mutation of mutationsList) {
				console.log('A child node has been added or removed.');
				console.log(mutation);
				for (let addedNode of mutation.addedNodes) {
					self._append(addedNode);
				}
			}
		};

		this.muatator = new MutationObserver (mutation_react);
		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperties('context');
	}
	connectedCallback () {
		super.connectedCallback();
		this.muatator.observe(this, this.constructor.mutation_options);
	}
	static get mutation_options () {
		return {
			childList: true,
		};
	}
	_append(node) {
		let slot_name = 's' + this._slot_counter.toString();
		this._slot_counter += 1;
		let slot = document.createElement('slot');
		slot.name = slot_name;
		let body = this.shadowRoot.querySelector('#pseudoBody');
		body.append(slot);
		node.slot = slot_name;
	}
	drag_start () {
		let overlay = this.shadowRoot.querySelector('#overlay');
		overlay.style.display = 'block';
	}
	drag_end () {
		let overlay = this.shadowRoot.querySelector('#overlay');
		overlay.style.display = 'none';
	}
	get context () {
		return this._context;
	}
	set context (value) {
		// Remove self from old context
		if (this._context !== null) {
			Elements.common.draggable_controller.removeListener(this, this._context);
		}
		Elements.common.draggable_controller.addListener(this, value);
		this._context = value;
	}
	static get observedAttributes () {
		return ['context'];
	}
	item_drag_start (caller, event) {
		let parent = this._get_parent();
		if (parent === null) {
			// TODO: Cancel drag
			caller.cancelDrag();
			throw new Error('Could not find parent to notify of drag');
		}
		parent.item_drag_start(caller, event);
	}
};

Elements.load(Elements.elements.DraggableContainer, 'elements-draggable-container');
};

main();
}

let test_drag = () => {
	let p = document.createElement('p');
	p.innerHTML = 'Hello';
	window.a.append(p);
}
