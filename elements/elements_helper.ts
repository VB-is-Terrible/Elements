import type {backbone} from './elements_backbone.js'
import type {manifest_single, manifest_optional, manifest_type_array} from './elements_types';


/**
 * Function to santize boolean attributes
 * @param  {*} value A boolean or a string representing a boolean
 * @return {Boolean}              Input converted to boolean
 */
export function booleaner (value: unknown): boolean {
        switch (typeof(value)) {
                case 'boolean':
                        return value;
                case 'string':
                        return !(value === 'false');
                default:
                        return Boolean(value);
        }
};


/**
 * Desanitizes a string for HTML.
 * Used for UI output where escaping is not required, i.e. not HTML.
 * e.g. placeholder value set via js
 * @param  {String} string Sanitized string
 * @return {String}        Unsafe string
 * @deprecated
 */
export function nameDesanitizer (string: string): string {
        string = string.replace(/&amp/g, '&');
        string = string.replace(/&lt/g, '<');
        string = string.replace(/&gt/g, '>');
        return string;
};

/**
 * Sanitizes a string for HTML.
 * @param  {String} string Unsafe string
 * @return {String}        Sanitized string
 * @deprecated
 */
export function nameSanitizer (string: string): string {
        string = string.trim();
        string = string.replace(/&/g, '&amp');
        string = string.replace(/</g, '&lt');
        string = string.replace(/>/g, '&gt');
        return string;
};

/**
 * Returns a equivalent requestAnimationFrame, but subsequent calls
 * before frame trigger cancel previous ones
 * @return {Function} Pretends to be requestAnimationFrame
 */
export function rafContext (): (f: (timestamp: number) => void) => void {
        let raf: number | null = null;
        return (f) => {
                if (raf !== null) {
                        cancelAnimationFrame(raf);
                }
                raf = requestAnimationFrame((e) => {
                        f(e);
                        raf = null;
                });
        };
};


/**
 * Make an async network request, returning response body
 * @param  {String} location location of file. Note: will not prefix .location for you
 * @return {Promise}         Promise that resolves to the response body, can error
 */
export async function request (location: string): Promise<any> {
        return fetch(location).then(
                (response) => {
                        if (response.ok) {
                                return response.text();
                        } else {
                                throw new Error(response.url);
                        }
                }
        );
};


/**
 * Helper function to generate function to perform attribute overwrite
 * @param  {HTMLElement} object   object to observe attribute on
 * @param  {String} property property to observe
 * @return {Function}          function to set value to attribute if it exists
 */
export function getInitProperty (object: backbone, property: string): () => void {
        return (() => {
                // If the attribute is been written to, it should be handled by
                // the attribute changed callback
                if (object.getAttribute(property) === null) {
                        //@ts-ignore
                        object.setAttribute(property, object[property]);
                }
        });
};

/**
 * Remove children of the element within an animation frame
 * @param {HTMLElement} element Element to remove children from
 */
export function removeChildren(element: HTMLElement) {
        requestAnimationFrame(() => {
                let children = [...element.children];
                for (let child of children) {
                        child.remove();
                }
        });
};


/**
 * Create a CustomEvent with the composed option enabled
 * @param {String} type The type of event to create
 * @param {*} detail The detail of the event
 * @param {Boolean} cancelable If the event can be canceled
 * @return {CustomEvent} The created event
 */
export function CustomComposedEvent(type: string, detail: unknown = null, cancelable: boolean = false): CustomEvent {
        return new CustomEvent(type, {
                detail: detail,
                bubbles: true,
                composed: true,
                cancelable: cancelable,
        });
};


/**
 * Returns a promise that will resolve in at least <timeout> milliseconds
 * @param  {Number} timeout Time in milliseconds to wait to resolve the promise
 * @return {Promise}         Promise that resolves in <timeout> milliseconds
 */
export function wait (timeout: number): Promise<void> {
        return new Promise<void>((resolve, _reject) => {
                // This is just typescript being stupid
                //@ts-ignore
                setTimeout(resolve, timeout);
        });
};


/**
 * Split an element name in seperated tokens
 * @param  {String} name Name to tokenise
 * @return {String[]}    Array of tokens
 */
export function tokenise (name: string): string[] {
	if (name.includes('-')) {
		return name.split('-');
	} else if (name.includes('/')) {
		return name.split('/');
	} else {
		return [name];
	}
};


/**
 * Removes the 'elements-' NS from a HTMLElement name
 * @param  {String} name name with 'elements-'
 * @return {String}      name without 'elements-'
 */
export function removeNSTag (name: string): string {
        if (name.indexOf('elements-') !== 0) {
                return name;
        } else {
                return name.substring(9);
        }
};


/**
 * Uppercase the first letter, leave the rest
 * @param  {String} string String to captialize
 * @return {String}        Captialized string
 */
export function captialize (string: string): string {
        return string.charAt(0).toUpperCase() + string.substring(1, string.length);
};

/**
 * Helper to reduce an object to only properties needed to stringify
 * @param  {Object} object     object to reduce
 * @param  {String[]} properties Properties to include
 * @return {Object}            new object with properties copied over
 */
export function jsonIncludes<O, K extends keyof O> (object: O, properties: (K & string)[]): object {
        let result: {[key: string]: unknown} = {};
        for (let property of properties) {
                result[property] = object[property];
        }
        return result;
};

/**
 * Converts a set to array, for stringification
 * @param  {Set} set Set to convert to array
 * @return {Array}   Array version of set
 */
export function setToArray<O> (set: Set<O> | Map<unknown, O>): Array<O> {
        let result = [];
        for (let entry of set.values()) {
                result.push(entry);
        }
        return result;
};

export type GConstructor<T = {}> = new (...args: any[]) => T;

/**
 * Random integer
 * @param  {Number} lower Lower bound
 * @param  {Number} upper Upper bound
 * @return {Number}       lower <= return <= upper
 */
export const randint = (lower: number, upper: number): number => {
	return Math.floor(Math.random() * (upper - lower) + lower);
};


/**
 * Contains the valid values of the manifest type
 * @type {Array<string>}
 */
const manifest_array_fields: manifest_type_array = ['css', 'provides', 'recommends', 'requires', 'resources', 'templates'];


/**
 * Upgrade a network optimized manifest to a program ready manifest
 * @param {manifest_optional} partial The network optimized partial manifest
 * @return                            The full manifest
 */
export const upgradeManifest = (partial: manifest_optional): manifest_single => {
        for (const array of manifest_array_fields) {
                if (!(array in partial)) {
                        partial[array] = [];
                }
        }
        return partial as manifest_single;
}


/**
 * Read a ResizeObserverEntry and return the borderBoxSize, regardless of browser
 * @param {ResizeObserverEntry} entry Entry to read
 * @return {ResizeObserverSize}
 */
export const get_border_box = (entry: ResizeObserverEntry): ResizeObserverSize => {
	if (entry.borderBoxSize) {
		// Firefox compat
		// @ts-ignore
		if (entry.borderBoxSize.blockSize !== undefined) {
			// @ts-ignore Firefox path
			return entry.borderBoxSize;
		} else {
			// @ts-ignore Chrome path
			return entry.borderBoxSize[0];
		}
	} else {
		// @ts-ignore
		return entry.contentRect;
	}
};
