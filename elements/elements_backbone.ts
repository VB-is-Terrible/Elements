const excludedProperties = new Set(['attributeInit', '___propertyStore']);
const defaultProperties = new Set();

/**
 * Create a new empty custom element, then place all the properties into
 * defaultProperties. Needed as HTMLElement varies between browsers
 * @private
 */
const initDefaultPreperties = function () {
	let Sentinel = class extends HTMLElement {};
	customElements.define('black-hole-sentinel-mjs', Sentinel);
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
        ___propertyStore: Map<string, any> | null;
        attributeInit: boolean = false;
        connected: boolean = false;
        static __backbone_version: number = 2;
	constructor () {
		super();
		this.___propertyStore = new Map();
		for (let property in this) {
			if (excludedProperties.has(property)) {
				continue;
			}
			if (!defaultProperties.has(property)) {
				this.___propertyStore.set(property, this[property]);
				delete this[property];
			}
		}
	}
	/**
	 * Called once inserted into DOM
	 * @instance
	 */
	connectedCallback () {
		if (this.attributeInit === false){
			this.___propertyStore = null;
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
	 */
	applyPriorProperties(...properties: (string)[]) {
		if (this.___propertyStore === null) {
			console.warn('It\'s too late to apply properties. Do this before connectedCallback');
			return;
		}
		// Because inheritance, typescript can't figure this out :(
		for (let prop of properties) {
			if (this.___propertyStore.has(prop)) {
				//@ts-ignore
				this[prop] = this.___propertyStore.get(prop);
			}
		}
	}
	/**
	 * Apply the property saved in the constructor, or initial
	 * if the property was not present
	 * @param  {String} property Property to restore
	 * @param  {*} initial       What to set the property to if it was saved
	 * @instance
	 */
	applyPriorProperty(property: string, initial: any) {
		if (this.___propertyStore === null) {
			console.warn('It\'s too late to apply properties. Do this before connectedCallback');
			return;
		}
		// Because inheritance, typescript can't figure this out :(
		if (this.___propertyStore.has(property)) {
			//@ts-ignore
			this[property] = this.___propertyStore.get(property);
		} else {
			//@ts-ignore
			this[property] = initial;
		}
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
        /**
         * Apply the properties saved in the constructor
         * @param  {...Strings} properties Properties to restore
         * @deprecated
         * @instance
         */
        applyPriorProperties(...properties: (string)[]) {
                console.warn('Using deprecated function applyPriorProperties');
                return super.applyPriorProperties(...properties);
        }
        /**
         * Apply the property saved in the constructor, or initial
         * if the property was not present
         * @param  {String} property Property to restore
         * @param  {*} initial       What to set the property to if it was saved
         * @instance
         */
        applyPriorProperty(property: string, initial: any) {
                console.warn('Using deprecated function applyPriorProperty');
                return super.applyPriorProperty(property, initial);
        }
}

initDefaultPreperties();
