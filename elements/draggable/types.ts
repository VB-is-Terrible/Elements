export type resource_id = number;

export type item_drag_start_t = {
	effect_allowed: resource_id;
	event: DragEvent;
}
