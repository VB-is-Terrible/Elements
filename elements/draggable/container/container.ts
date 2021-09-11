import {Elements} from '../../elements_core.js';
import {backbone4, setUpAttrPropertyLink, applyPriorProperties} from '../../elements_backbone.js';
import {CustomComposedEvent, captialize} from '../../elements_helper.js';
import {draggable_controller} from '../Common/Common.js'
import type {item_drag_start_t, drag_callback, item_drag_start2_t, item_drop_t} from '../types';


const ELEMENT_NAME = 'DraggableContainer';

type event_t = {
        drop: drag_callback;
        over: drag_callback;
};

const mutation_options = {
	childList: true,
};
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

/**
 * [DraggableContainer Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
export class DraggableContainer extends backbone4 {
        #mutator: MutationObserver;
        #events: event_t;
        #context: string = '';
        context!: string;
        #overlay: HTMLDivElement;
        #body: HTMLDivElement;
        effect_allowed: DataTransfer['effectAllowed'];
        drop_effect: DataTransfer['dropEffect'];
        #slot_counter: number = 0;
        #drag_subject: boolean = false;
	constructor () {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(ELEMENT_NAME);
		let mutation_react: MutationCallback = (mutationsList, _observer) => {
			for (let mutation of mutationsList) {
				console.log('A child node has been added or removed.');
				console.log(mutation);
				for (let addedNode of mutation.addedNodes) {
					this.#append(addedNode as Element);
				}
			}
		};

		this.#mutator = new MutationObserver (mutation_react);
		this.#events = {
			drop: (e) => {this.onDrop(e);},
			over: (e) => {this.onDragOver(e);},
		};

                this.#overlay = template.querySelector('#overlay') as HTMLDivElement;
                this.#body = template.querySelector('#pseudoBody') as HTMLDivElement;

                this.addEventListener('elements-item-drag-start', (event) => {
                        this.#item_drag_start(event);
                        event.stopPropagation();
                });

		//Fancy code goes here
		shadow.appendChild(template);
		applyPriorProperties(this, 'context');

		setUpAttrPropertyLink(this, 'effect_allowed');
		setUpAttrPropertyLink(this, 'drop_effect');
		this.effect_allowed = 'link';
		this.drop_effect = 'link';
                setUpAttrPropertyLink(this, 'context', '', (value: string) => {this.#change_context(value);});
		applyPriorProperties(this, 'effect_allowed', 'drop_effect');
	}
	connectedCallback () {
		let initialized = this.attributeInit;
		super.connectedCallback();
		if (!initialized) {
			for (let child of this.children) {
				this.#append(child);
			}
		}
		this.#mutator.observe(this, mutation_options);
		// Attach listener
		draggable_controller.addListener(this, this.#context);
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		this.#mutator.disconnect();

		draggable_controller.removeListener(this, this.#context);
	}
	#append(node: Element) {
		let slot_name = 's' + this.#slot_counter.toString();
		this.#slot_counter += 1;
		let slot = document.createElement('slot');
		slot.name = slot_name;
		this.#body.append(slot);
		node.slot = slot_name;
	}
	drag_start (effectAllowed: string) {
		if (this.#drag_subject) {
			this.#drag_subject = false;
			return;
		}
		if (!this.matches(effectAllowed)) {
			return;
		}
		this.#overlay.style.display = 'block';
		this.#attach_drop();
		console.log('drop started')
	}
	drag_end () {
		this.#overlay.style.display = 'none';
		this.#detach_drop();
		console.log('drop ended');
	}
        #change_context (value: string) {
                if (this.connected) {
			// Remove self from old context
			if (this.#context !== null) {
				draggable_controller.removeListener(this, this.#context);
			}
			draggable_controller.addListener(this, value);
		}
		this.#context = value;
        }
	static get observedAttributes () {
		return ['context', 'effect_allowed', 'drop_effect'];
	}
	#item_drag_start (event: Event) {
                const details_1 = (event as CustomEvent<item_drag_start_t>).detail;
                const drag_event = details_1.event;
		drag_event.dataTransfer!.effectAllowed = this.effect_allowed;
                const details_2: item_drag_start2_t = {
                        rv: draggable_controller.registerHandle(),
                        event: drag_event,
                };
                const ev = CustomComposedEvent('elements-item-drag-start2', details_2);
                this.dispatchEvent(ev);
                const rv = draggable_controller.retriveResource(details_2.rv);
                if (rv === undefined) {
                        // Not setting dataTransfer automatically cancels drag on firefox
                        // preventDefault is needed for chrome
                        // event.preventDefault();
                        console.warn('Could not find parent to notify of drag');
                        return;
                }
		this.#drag_subject = true;
                draggable_controller.setResource(details_1.effect_allowed, this.effect_allowed);
		return this.effect_allowed;
	}
	#attach_drop () {
		this.#overlay.addEventListener('drop', this.#events.drop);
		this.#overlay.addEventListener('dragover', this.#events.over);
	}
	#detach_drop () {
		this.#overlay.removeEventListener('drop', this.#events.drop);
		this.#overlay.removeEventListener('dragover', this.#events.over);
	}
	onDrop (event: DragEvent) {
		// Clear drag notice;
		event.preventDefault();
		draggable_controller.drag_end(this.context);

                const details: item_drop_t = {
                        event: event,
                        rv: draggable_controller.registerHandle(),
                };
                const ev = CustomComposedEvent('elements-item-drop', details);
                this.dispatchEvent(ev);
                const rv = draggable_controller.retriveResource(details.rv);
                if (rv === undefined) {
                        // event.preventDefault();
                        console.warn('Could not find parent to notify of drop');
                        return;
                }
	}
	onDragOver (event: DragEvent) {
		event.preventDefault();
                if (event.dataTransfer === null) {
                        return;
                }
		event.dataTransfer.dropEffect = this.drop_effect;
	}
	matches (effectAllowed: string) {
		let effects = DraggableContainer.splitEffects(effectAllowed);
		if (effects.includes(this.drop_effect)) {
			return true;
		} else {
			return false;
		}
	}
	item_drop () {
	}
        static setEffects (...effects: Array<string>) {
                if (effects.length === 0) {
                        return 'none';
                } else if (effects.length === 3) {
                        return 'all';
                } else {
                        effects.sort();
                        return this.#joinEffects(effects);
                }
        }
	static splitEffects (effectAllowed: string) {
		if (effectAllowed === 'unintialized' || effectAllowed === 'none') {
			return [];
		} else if (effectAllowed === 'all') {
			return ['link', 'move', 'copy'];
		}
		let pattern = /([a-z]*)([A-Z][a-z]*)?/;
		let match = effectAllowed.match(pattern);
                if (match === null) {
                        return [];
                }
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
	static #joinEffects (effects: Array<string>) {
		let result = effects[0];
		for (let i = 1; i < effects.length; i++) {
			result += captialize(effects[i]);
		}
		return result;
	}
};

export default DraggableContainer;

Elements.load(DraggableContainer, 'elements-draggable-container');

// export const test_drag = () => {
// 	let p = document.createElement('p');
// 	p.innerHTML = 'Hello';
// 	window.a.append(p);
// }
