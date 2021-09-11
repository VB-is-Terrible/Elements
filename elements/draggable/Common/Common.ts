const CONSOLE = true;

import {Elements} from '../../elements_core.js';


/**
 * Namespace for draggable helper objects
 * @type {Object}
 * @namespace Elements.classes.draggable
 */
Elements.classes.Draggable = {};

/**
 * Object to respond to drag start & end
 * @Interface DraggableListener
 *
 */

/**
 * @function drag_start
 * @description callback for a drag & drop start
 * @param {String} effectAllowed effectAllowed property of the pending drag event's dataTransfer
 * @name DraggableListener.drag_start
 */

/**
 * @function drag_end
 * @description callback for a drag & drop end
 * @name DraggableListener.drag_end
*/

/**
 * Object to be notified of drag starts and ends through the DOM chain
 * @Interface DraggableObserver
 */

/**
 * @function item_drag_start
 * @description callback for a drag & drop start
 * @param {Object} caller Object that was dragged
 * @param {Event} event The drag start event
 * @name DraggableObserver.item_drag_start
 */

 /**
  * @function item_drop
  * @description callback for a 'drag & drop'  drop
  * @param {Object} caller Object that was dropped into
  * @param {Event} event The drop event
  * @name DraggableObserver.item_drop
  */


/**
 * Error in draggable module
 * @extends Error
 */
export class DraggableError extends Error {}

interface DraggableListener {
	drag_start: (effect: string) => void;
	drag_end: () => void;
};

/**
 * Stores listeners for a drag context
 */
export class DragContext {
	listeners: Set<DraggableListener>;
	constructor () {
		/**
		 * Set of listeners
		 * @type {Set}
		 */
		this.listeners = new Set();
	}
	/**
	 * Add a listener to this context
	 * @param {DraggableListener} listener Listener to register
	 */
	addListener (listener: DraggableListener) {
		this.listeners.add(listener);
	}
	/**
	 * Remove a listener from this context
	 * @param {DraggableListener} listener Listener to remove
	 */
	removeListener (listener: DraggableListener) {
		this.listeners.delete(listener);
	}
	/**
	 * Inform all listeners of this context that a drag & drop has started
	 */
	drag_start (effectAllowed: string) {
		for (let listener of this.listeners) {
			listener.drag_start(effectAllowed);
		}
	}
	/**
	 * Inform all listeners of this context that a drag & drop has ended
	 */
	drag_end () {
		for (let listener of this.listeners) {
			listener.drag_end();
		}
	}
	/**
	 * Number of listeners to this context
	 * @return {Number} Number of listeners
	 */
	get size (): number {
		return this.listeners.size;
	}
}

/**
 * Manages DragContext objects, by making and deleting them as needed.
 * Also performs sanity checks
 * Note: Contexts are referred to as strings.
 */
export class DragController {
	contexts: Map<string, DragContext> = new Map();
	resources: Map<number, unknown> = new Map();
	#open_handles: Set<number> = new Set();
	#resource_count: number = 0;
	constructor () {
	}
	/**
	 * Check if a context name is valid
	 * @param  {String} context Name of context to check
	 * @return {Boolean}         Whether the context is valid
	 */
	validContext (context: string): boolean {
		if (context === null || context === '') {
			return false;
		} else {
			return true;
		}
	}
	/**
	 * Add the listener to the context
	 * @param {DraggableListener} listener Listener to add
	 * @param {String} context  Context to add to
	 */
	addListener (listener: DraggableListener, context: string) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			this.contexts.set(context, new DragContext());
		}
		this.contexts.get(context)!.addListener(listener);
	}
	/**
	 * Remove the listener from the context
	 * @param  {DraggableListener} listener Listener to remove
	 * @param  {String} context  Context to remove from
	 */
	removeListener (listener: DraggableListener, context: string) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			throw new DraggableError(`Context ${context} does not exist`);
		}
		let context_obj = this.contexts.get(context)!;
		context_obj.removeListener(listener);
		if (context_obj.size === 0) {
			this.contexts.delete(context);
		}
	}
	/**
	 * Inform all listeners of the context that a drag & drop has started
	 * @param  {String} context Context to inform
	 */
	drag_start (context: string, effectAllowed: string) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			if (CONSOLE) {
				console.warn('drag_started on empty context');
			}
		} else {
			this.contexts.get(context)!.drag_start(effectAllowed);
		}
	}
	/**
	 * Inform all listeners of the context that a drag & drop has ended
	 * @param  {String} context Context to inform
	 */
	drag_end (context: string) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			if (CONSOLE) {
				console.warn('drag_ended on empty context');
			}
		} else {
			this.contexts.get(context)!.drag_end();
		}
	}
	registerResourceHandle () {
		this.#resource_count++;
		this.#open_handles.add(this.#resource_count);
		return this.#resource_count;
	}
	setResource (resource_id: number, resource: unknown) {
		if (this.#open_handles.has(resource_id)) {
			this.#open_handles.delete(resource_id);
			this.resources.set(resource_id, resource);
		} else {
			throw new Error('Invalid resource id');
		}
	}
	registerResource (resource: unknown) {
		this.#resource_count++;
		this.resources.set(this.#resource_count, resource);
		return this.#resource_count;
	}
	readResource(resource_id: number) {
		return this.resources.get(resource_id);
	}
	retriveResource (resource_id: number) {
		let result = this.resources.get(resource_id);
		this.resources.delete(resource_id);
		return result;
	}
}


//@ts-ignore
Elements.classes.Draggable.DragController = DragController;
//@ts-ignore
Elements.classes.Draggable.DraggableError = DraggableError;
//@ts-ignore
Elements.classes.Draggable.DragContext = DragContext;

export const draggable_controller = new DragController();
/**
* Main drag controller for general contexts
* @type {DragController}
*/
Elements.common.draggable_controller = draggable_controller;

Elements.loaded('draggable-Common');
