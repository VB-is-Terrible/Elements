import type {GConstructor} from '../elements_helper.js'

export type resource_id = number;

export class DragDetail {}

export const read_details = <T extends DragDetail>(event: CustomEvent<T>, returnClass: { new(...args: any[]): T }): T => {
	const detail = event.detail;
	if (detail.constructor === returnClass) {
		return detail as T;
	} else {
		throw new Error(`Invalid event data, ${detail.constructor.name} is not ${returnClass.name}`);
	}
};


export class ItemDragStartP1 extends DragDetail {
	readonly effect_allowed: resource_id;
	readonly event: DragEvent;
	readonly source: Element;
	constructor(effect_allowed: resource_id,
	            event: DragEvent,
	            source: Element) {
		super();
		this.effect_allowed = effect_allowed;
		this.event = event;
		this.source = source;
	}
	static readonly event_string = 'elements-item-drag-start';
}


export class ItemDragStartP2 extends DragDetail {
	readonly event: DragEvent;
	readonly rv: resource_id;
	readonly source: Element;
	constructor(event: DragEvent, rv: resource_id, source: Element) {
		super();
		this.event = event;
		this.rv = rv;
		this.source = source;
	}
	static readonly event_string = 'elements-item-drag-start2';
}


export class ItemDrop extends DragDetail {
	readonly event: DragEvent;
	readonly rv: resource_id;
	constructor(event: DragEvent, rv: resource_id) {
		super();
		this.event = event;
		this.rv = rv;
	}
	static readonly event_string = 'elements-item-drop';
};


export type drag_callback = (e: DragEvent) => void;
