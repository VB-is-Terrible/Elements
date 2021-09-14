
import {Elements} from '../../elements_core.js';
import {backbone4, setUpAttrPropertyLink} from '../../elements_backbone.js';
import {CustomComposedEvent} from '../../elements_helper.js';
import {draggable_controller} from '../Common/Common.js'
import type {drag_callback} from '../types';
import {ItemDragStartP1} from '../types.js';

const ELEMENT_NAME = 'DraggableItem';
type event_t = {
	start: drag_callback,
	end: drag_callback,
	test: (e: TouchEvent) => void,
};

/**
 * [DraggableItem Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
export class DraggableItem extends backbone4 {
	context!: string;
	#events: event_t;
	#draggable: HTMLDivElement;
	constructor () {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(ELEMENT_NAME);
		this.#draggable = template.querySelector('#draggable') as HTMLDivElement;
		// Set up attribute - property reflection

		this.#events = {
			start: (e) => {this.onDragStart(e);},
			end: (e) => {this.onDragEnd(e);},
			test: (_e) => {this.onTouchStart();},
		};
		shadow.appendChild(template);
		this.#end_drag();
		setUpAttrPropertyLink(this, 'context', '');
	}
	static get observedAttributes () {
		return ['context'];
	}
	onDragStart (e: DragEvent) {
		let effectAllowed = this.notify(e);
		e.dataTransfer!.setData('text/plain', '');

		draggable_controller.drag_start(this.context, effectAllowed);
		this.#begin_drag();
		console.log(e);
	}
	notify (event: DragEvent) {
		const resource_id = draggable_controller.registerHandle();
		const data = new ItemDragStartP1(resource_id, event, this);
		const ev = CustomComposedEvent(ItemDragStartP1.event_string, data);
		this.dispatchEvent(ev);
		const effect_allowed = draggable_controller.retriveResource(resource_id) as string | undefined;
		if (effect_allowed === undefined) {
			// Not setting dataTransfer automatically cancels drag
			// preventDefault is needed for chrome
			event.preventDefault();
			throw new Error('Could not find parent to notify of drag');
		}
		return effect_allowed;
	}
	onDragEnd (_event: DragEvent) {
		// Don't think there is anything that needs notifying
		draggable_controller.drag_end(this.context);
		this.#end_drag();
	}
	#end_drag () {
		this.#draggable.addEventListener('dragstart', this.#events.start);
		this.#draggable.removeEventListener('dragend', this.#events.end);
		if (!this.attributeInit) {
			this.#draggable.addEventListener('touchstart', this.#events.test);
		}
	}
	#begin_drag () {
		this.#draggable.removeEventListener('dragstart', this.#events.start);
		this.#draggable.addEventListener('dragend', this.#events.end);
	}
	onTouchStart () {
	}
};

export default DraggableItem;

Elements.load(DraggableItem, 'elements-draggable-item');
