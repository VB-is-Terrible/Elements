const excludedProperties = new Set(['attributeInit', 'connected']);
const defaultProperties = new Set();
const REPORTING_MODE = true;

/**
 * Create a new empty custom element, then place all the properties into
 * defaultProperties. Needed as HTMLElement varies between browsers
 * @private
 */
const initDefaultPreperties = function () {
	let Sentinel = class extends HTMLElement {};
	customElements.define('black-hole-sentinel-ts', Sentinel);
	let base = new Sentinel();
	for (let property in base) {
		defaultProperties.add(property);
	}
}

export interface Backbone {
	__backbone_version: number;
}
/**
 * Base class for elements
 * @property {Function} constructor
 * @property {Object} getDict Mapping of the getters set by setUpAttrPropertyLink
 * @property {Object} setDict Mapping of the setters set by setUpAttrPropertyLink
 * @property {Booelean} attributeInit Whether the attributes have been initalized
 * @alias Elements.elements.backbone
 */
export class backbone extends HTMLElement {
        getDict: {[key: string]: () => void} = {};
        setDict: {[key: string]: (_value: any) => void} = {};
        attributeInit: boolean = false;
        static __backbone_version: number = 1;
	/**
	 * Make a new element
	 */
	constructor () {
                super();
        }
	/**
	 * Called once inserted into DOM
	 */
	connectedCallback () {
		if (this.attributeInit === false){
			for (let func in this.getDict) {
				this.getDict[func]();
			}
		}
		this.attributeInit = true;
	}
	/**
	 * Called when a attribute changes
	 * @param  {String} attrName name of attribute changed
	 * @param  {String} oldValue Value before change
	 * @param  {String} newValue Value after change
	 */
	attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
		if (attrName in this.setDict && oldValue !== newValue) {
			this.setDict[attrName](newValue);
		}
	}
	disconnectedCallback () {

	}
	static get observedAttributes(): Array<string> {
		return [];
	}
}


const property_store_sym = Symbol('elements property_store');


/**
 * Backbone for newer elements (v2.0). These elements can use
 * ES6 getter/setters for regular properties, restoring prior properties
 * via applyProperties.
 * Does the connectedCallback/attributeChangedCallback part of setUpAttrPropertyLink
 * without declaration, based on observedAttributes
 * @type {Object}
 * @property {Booelean} attributeInit Whether the attributes have been initalized
 * @alias Elements.elements.backbone2
 */
// Note: Does weird polymorphic stuff, type checking doesn't really work
export class backbone2 extends HTMLElement {
        // This member must never be used by any children
        attributeInit: boolean = false;
        connected: boolean = false;
        static __backbone_version: number = 2;
        [property_store_sym]?: Map<string, unknown>;
	constructor () {
		super();
		const propertyStore = new Map();
		for (let property in this) {
			if (excludedProperties.has(property)) {
				continue;
			}
			if (!defaultProperties.has(property)) {
				propertyStore.set(property, this[property]);
				delete this[property];
			}
		}
                this[property_store_sym] = propertyStore;
	}
	/**
	 * Called once inserted into DOM
	 * @instance
	 */
	connectedCallback () {
		if (this.attributeInit === false) {
                        delete this[property_store_sym];
                        // @ts-ignore
			for (let attribute of this.constructor.observedAttributes) {
                                //@ts-ignore
				if (this.getAttribute(attribute) === null && this[attribute] !== null) {
                                        //@ts-ignore
					this.setAttribute(attribute, this[attribute]);
				}
			}
		}
		this.attributeInit = true;
		this.connected = true;
	}
	/**
	 * Called when a attribute changes
	 * @param  {String} attrName name of attribute changed
	 * @param  {String} _oldValue Value before change
	 * @param  {String} newValue Value after change
	 * @instance
	 */
	attributeChangedCallback<K extends keyof backbone2>(attrName: K & string, _oldValue: string, newValue: string) {
		if (this[attrName] !== newValue) {
			//@ts-ignore
			this[attrName] = newValue;
		}
	}
	/**
	 * Apply the properties saved in the constructor
	 * @param  {...Strings} properties Properties to restore
	 * @instance
	 * @deprecated
	 */
	applyPriorProperties<K extends keyof backbone2>(...properties: (K & string)[]) {
                if (REPORTING_MODE) {
                        console.warn('Using deprecated function \'applyPriorProperties\'');
                }
                applyPriorProperties(this, ...properties);
	}
	/**
	 * Apply the property saved in the constructor, or initial
	 * if the property was not present
	 * @param  {String} property Property to restore
	 * @param  {*} initial       What to set the property to if it was saved
	 * @instance
	 * @deprecated
	 */
	applyPriorProperty<K extends keyof backbone2>(property: K & string, initial: any) {
                if (REPORTING_MODE) {
                        console.warn('Using deprecated function \'applyPriorProperty\'');
                }
                applyPriorProperty(this, property, initial)
	}
	/**
	 * Called when removed from the dom.
	 * Here for completion
	 * @instance
	 */
	disconnectedCallback () {
		this.connected = false;
	}
        static get observedAttributes(): Array<string> {
                return [];
        }
};


/**
 * Get the property saved in the constuctor
 * @param  {object} object Object to retrieve property from
 * @param  {string} property Property to fetch
 * @return                 Fetched property
 */
export const getPriorProperty = <O extends backbone2, K extends keyof O>(object: O, property: K & string): unknown => {
        const property_store = object[property_store_sym];
        if (property_store === undefined) {
                console.warn('It\'s too late to apply properties. Do this before connectedCallback');
                return;
        }
        return property_store.get(property);
};


/**
 * Apply the properties saved in the constructor
 * @param  {object} object Object to retrieve properties from
 * @param  {...Strings} properties Properties to restore
 */
export const applyPriorProperties = <O extends backbone2, K extends keyof O>(object: O, ...properties: Array<K & string>) => {
        const property_store = object[property_store_sym];
        if (property_store === undefined) {
                console.warn('It\'s too late to apply properties. Do this before connectedCallback');
                return;
        }
        for (let prop of properties) {
                if (property_store.has(prop)) {
                        object[prop] = property_store.get(prop) as any;
                }
        }
};

/**
 * Apply the property saved in the constructor, or initial
 * if the property was not present
 * @param  {object} object Object to retrieve property from
 * @param  {String} property Property to restore
 * @param  {*} initial       What to set the property to if it was saved
 */
export const applyPriorProperty = <O extends backbone2, K extends keyof O>(object: O, property: string & K, initial: any) => {
        const property_store = object[property_store_sym];
        if (property_store === undefined) {
                console.warn('It\'s too late to apply properties. Do this before connectedCallback');
                return;
        }
        if (property_store.has(property)) {
                object[property] = property_store.get(property) as any;
        } else {
                object[property] = initial;
        }
};






/**
 * Backbone for v3 elements, aka modules
 * @extends Elements.elements.backbone2
 * @alias Elements.elements.backbone3
 */
export class backbone3 extends backbone2 {
        static __backbone_version = 3;
	constructor () {
		super();
	}
	/**
	 * Runs a querySelector find on the shadow root
	 * @param  {String} CSSSelector CSS selector to search for
	 * @return {?DOMElement}             Element found by css selector
	 */
	shadowQuery (CSSSelector: string): HTMLElement | null {
		return this.shadowRoot!.querySelector(CSSSelector);
	}


}

export class backbone4 extends backbone3 {
        static __backbone_version = 4;
}


/**
 * Sets up a linked object property/attribute, for backbone2. Does things like copy attribute value to
 * property value once inserted into DOM, checking if the property
 * already has a value.
 * @param  {HTMLElement} object      Element to set up link on
 * @param  {String} property         property/attribute to link
 * @param  {*} [initial=null]         value to intialize the type as
 * @param  {Function} [eventTrigger] Function to call after property has been set
 * @param  {Function} [santizer]     Function passed (new value, old value) before value is set. returns value to set property to.
 */
export function setUpAttrPropertyLink<O, K extends keyof O, T extends {toString: () => string} & O[K]> (
        object: backbone2 & O,
        property: K & string,
        initial: T | null = null,
        eventTrigger: (value: T) => void = (_value: T) => {},
        santizer: (value: T & string, old_value: T) => T = (value: T & string, oldValue: T) => {return value !== null ? value : oldValue;}) {

        const fail_message = 'Attr-Property must be in constructor.observedAttributes';
        //@ts-ignore
        console.assert((object.constructor.observedAttributes as unknown as Array<string>).includes(property), fail_message);

        let hidden: T;
        let getter = () => {return hidden;};
        let setter = (raw_value: T & string) => {
                const value = santizer(raw_value, hidden);
                if (value === hidden) {return;}
                hidden = value;
                if (object.attributeInit) {
                        object.setAttribute(property, value.toString());
                }
                eventTrigger(value);
        };
        Object.defineProperty(object, property, {
                enumerable: true,
                configurable: true,
                get: getter,
                set: setter,
        });
        applyPriorProperty(object, property, initial);
};


initDefaultPreperties();
