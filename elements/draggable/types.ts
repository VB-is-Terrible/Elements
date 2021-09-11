export type resource_id = number;

export type item_drag_start_t = {
	effect_allowed: resource_id;
	event: DragEvent;
}

export type item_drag_start2_t = {
	event: DragEvent;
	rv: resource_id;
}

export type item_drop_t = {
	event: DragEvent;
	rv: resource_id;
};

export type drag_callback = (e: DragEvent) => void;
