'use strict'

{
const CONSOLE = true;
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
class DraggableError extends Error {}

/**
 * Stores listeners for a drag context
 */
class DragContext {
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
	addListener (listener) {
		this.listeners.add(listener);
	}
	/**
	 * Remove a listener from this context
	 * @param {DraggableListener} listener Listener to remove
	 */
	removeListener (listener) {
		this.listeners.delete(listener);
	}
	/**
	 * Inform all listeners of this context that a drag & drop has started
	 */
	drag_start (effectAllowed) {
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
	get size () {
		return this.listeners.size;
	}
}

/**
 * Manages DragContext objects, by making and deleting them as needed.
 * Also performs sanity checks
 * Note: Contexts are referred to as strings.
 */
class DragController {
	constructor () {
		this.contexts = new Map();
		this.resources = new Map();
		this._resource_count = 0;
	}
	/**
	 * Check if a context name is valid
	 * @param  {String} context Name of context to check
	 * @return {Boolean}         Whether the context is valid
	 */
	validContext (context) {
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
	addListener (listener, context) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			this.contexts.set(context, new DragContext());
		}
		this.contexts.get(context).addListener(listener);
	}
	/**
	 * Remove the listener from the context
	 * @param  {DraggableListener} listener Listener to remove
	 * @param  {String} context  Context to remove from
	 */
	removeListener (listener, context) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			throw new DraggableError(`Context ${context} does not exist`);
		}
		let context_obj = this.contexts.get(context);
		context_obj.removeListener(listener);
		if (context_obj.size === 0) {
			this.contexts.delete(context);
		}
	}
	/**
	 * Inform all listeners of the context that a drag & drop has started
	 * @param  {String} context Context to inform
	 */
	drag_start (context, effectAllowed) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			if (CONSOLE) {
				console.warn('drag_started on empty context');
			}
		} else {
			this.contexts.get(context).drag_start(effectAllowed);
		}
	}
	/**
	 * Inform all listeners of the context that a drag & drop has ended
	 * @param  {String} context Context to inform
	 */
	drag_end (context) {
		if (!this.validContext(context)) {return;}
		if (!this.contexts.has(context)) {
			if (CONSOLE) {
				console.warn('drag_ended on empty context');
			}
		} else {
			this.contexts.get(context).drag_end();
		}
	}
	registerResource (resource) {
		this._resource_count++;
		this.resources.set(this._resource_count, resource);
		return this._resource_count;
	}
	retriveResource (resource_id) {
		let result = this.resources.get(resource_id);
		this.resources.delete(resource_id);
		return result;
	}
}

{
	let _check_parent = (parent) => {
		if (parent === undefined || parent === null) {
			return false;
		}
		let functions = ['item_drag_start', 'item_drop'];
		for (let func of functions) {
			if (!(typeof parent[func] === 'function')) {
				return false;
			}
		}
		return true;
	};
	Elements.classes.Draggable.getParent = (childObject) => {
		let parent = childObject.parentElement;
		while (parent !== null && !(_check_parent(parent))) {
			parent = parent.parentElement;
		}
		// Final check for shadowRoot parents
		if (parent === null) {
			let shadowParent = childObject.getRootNode().host;
			if (shadowParent !== null) {
				if (_check_parent(shadowParent)) {
					parent = shadowParent;
				}
			}
		}
		return parent;
	};
}

Elements.classes.Draggable.DragController = DragController;
Elements.classes.Draggable.DraggableError = DraggableError;
Elements.classes.Draggable.DragContext = DragContext;
/**
* Main drag controller for general contexts
* @type {DragController}
*/
Elements.common.draggable_controller = new DragController();

Elements.loaded('draggable-Common');
}
