'use strict';

/**
 * External interface for parents of draggable-containers
 * @Interface DraggableParent
 */

/**
 * @function item_drag_start
 * @description callback for a drag & drop start
 * @param {Elements.elements.DraggableItem} caller Item been dragged
 * @param {DragEvent} event DragEvent associated with the drag
 * @name DraggableParent.item_drag_start
 */

/**
 * @function item_drop
 * @description callback for a drag & drop end
 * @param {Elements.elements.DraggableItem} caller Item been dropped on
 * @param {DragEvent} event DragEvent associated with the drop
 * @name DraggableParent.item_drop
 */

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
		this._drag_subject = false;
		this._connected = false;
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
		this.events = {
			drop: (e) => {self.onDrop(e);},
			over: (e) => {self.onDragOver(e);},
		};
		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperties('context');
		Elements.setUpAttrPropertyLink2(this, 'effect_allowed');
		Elements.setUpAttrPropertyLink2(this, 'drop_effect');
		this.effect_allowed = 'link';
		this.drop_effect = 'link';
		this.applyPriorProperties('effect_allowed', 'drop_effect');
	}
	connectedCallback () {
		let initialized = this.attributeInit;
		super.connectedCallback();
		if (!initialized) {
			for (let child of this.children) {
				this._append(child);
			}
		}
		this.muatator.observe(this, this.constructor.mutation_options);
		// Attach listener
		Elements.common.draggable_controller.addListener(this, this._context);
		this._connected = true;
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		this.muatator.disconnect();

		Elements.common.draggable_controller.removeListener(this, this._context);
		this._connected = false;

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
	drag_start (effectAllowed) {
		if (this._drag_subject) {
			this._drag_subject = false;
			return;
		}
		if (!this.matches(effectAllowed)) {
			return;
		}
		let overlay = this.shadowRoot.querySelector('#overlay');
		overlay.style.display = 'block';
		this._attach_drop();
		console.log('drop started')
	}
	drag_end () {
		let overlay = this.shadowRoot.querySelector('#overlay');
		overlay.style.display = 'none';
		this._detach_drop();
		console.log('drop ended')
	}
	get context () {
		return this._context;
	}
	set context (value) {
		if (value === this._context) {
			return;
		}
		// Check to see if there is a context to remove
		if (this._connected) {
			// Remove self from old context
			if (this._context !== null) {
				Elements.common.draggable_controller.removeListener(this, this._context);
			}
			Elements.common.draggable_controller.addListener(this, value);
		}
		this._context = value;
		if (this.attributeInit) {
			this.setAttribute('context', value);
		}
	}
	static get observedAttributes () {
		return ['context', 'effect_allowed', 'drop_effect'];
	}
	item_drag_start (caller, event) {
		event.dataTransfer.effectAllowed = this.effect_allowed;
		let parent = Elements.classes.Draggable.getParent(this);
		if (parent === null) {
			// Not setting dataTransfer automatically cancels drag on firefox
			// preventDefault is needed for chrome
			// event.preventDefault();
			console.warn('Could not find parent to notify of drag');
		} else {
			parent.item_drag_start(caller, event);
		}
		this._drag_subject = true;
		return this.effect_allowed;
	}
	_attach_drop () {
		let dropzone = this.shadowRoot.querySelector('#overlay');
		dropzone.addEventListener('drop', this.events.drop);
		dropzone.addEventListener('dragover', this.events.over);
	}
	_detach_drop () {
		let dropzone = this.shadowRoot.querySelector('#overlay');
		dropzone.removeEventListener('drop', this.events.drop);
		dropzone.removeEventListener('dragover', this.events.over);
	}
	onDrop (event) {
		// Clear drag notice;
		Elements.common.draggable_controller.drag_end(this.context);
		let parent = Elements.classes.Draggable.getParent(this);
		if (parent === null) {
			// event.preventDefault();
			console.warn('Could not find parent to notify of drop');
			return;
		}
		console.log(event.dataTransfer.effectAllowed);
		parent.item_drop(this, event);
	}
	onDragOver (event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = this.drop_effect;
	}
	setEffects (...effects) {
		if (effects.length === 0) {
			return 'none';
		} else if (effects.length === 3) {
			return 'all';
		} else {
			effects.sort();
			return this.constructor.joinEffects(effects);
		}
	}
	matches (effectAllowed) {
		let effects = this.constructor.splitEffects(effectAllowed);
		if (effects.includes(this.drop_effect)) {
			return true;
		} else {
			return false;
		}
	}
	item_drop () {
	}
	static splitEffects (effectAllowed) {
		if (effectAllowed === 'unintialized' || effectAllowed === 'none') {
			return [];
		} else if (effectAllowed === 'all') {
			return ['link', 'move', 'copy'];
		}
		let pattern = /([a-z]*)([A-Z][a-z]*)?/;
		let match = effectAllowed.match(pattern);
		if (match[2] === undefined) {
			return [match[1]];
		} else {
			let effects = match.splice(1, 2);
			for (let i = 0; i < effects.length; i++) {
				effects[i] = effects[i].toLowerCase();
			}
			return effects;
		}

	}
	static joinEffects (effects) {
		let result = effects[0];
		for (let i = 1; i < effects.length; i++) {
			result += Elements.captialize(effects[i]);
		}
		return result;
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
