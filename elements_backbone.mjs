const excludedProperties = new Set(['attributeInit', '___propertyStore']);
const defaultProperties = new Set();

/**
 * Create a new empty custom element, then place all the properties into
 * defaultProperties. Needed as HTMLElement varies between browsers
 */
const initDefaultPreperties = function () {
	let Sentinel = class extends HTMLElement {};
	customElements.define('black-hole-sentinel-mjs', Sentinel);
	let base = new Sentinel();
	for (let property in base) {
		defaultProperties.add(property);
	}
}

/**
 * Base class for elements
 * @property {Function} constructor
 * @property {Object} getDict Mapping of the getters set by setUpAttrPropertyLink
 * @property {Object} setDict Mapping of the setters set by setUpAttrPropertyLink
 * @property {Booelean} attributeInit Whether the attributes have been initalized
 */
class backbone extends HTMLElement {
	/**
	 * Make a new element
	 */
	constructor () {
		super();

		this.getDict = {};
		this.setDict = {};

		this.attributeInit = false;
		return this;
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
	attributeChangedCallback(attrName, oldValue, newValue) {
		if (attrName in this.setDict && oldValue !== newValue) {
			this.setDict[attrName](newValue);
		}
	}
	disconnectedCallback () {

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
 */
class backbone2 extends HTMLElement {
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
		this.attributeInit = false;
	}
	/**
	 * Called once inserted into DOM
	 * @memberof! Elements.elements.backbone2
	 * @instance
	 */
	connectedCallback () {
		if (this.attributeInit === false){
			this.___propertyStore = null;
			if (this.constructor.observedAttributes === undefined) {
				return;
			}
			for (let attribute of this.constructor.observedAttributes) {
				if (this.getAttribute(attribute) === null && this[attribute] !== null) {
					this.setAttribute(attribute, this[attribute]);
				}
			}
		}
		this.attributeInit = true;
	}
	/**
	 * Called when a attribute changes
	 * @param  {String} attrName name of attribute changed
	 * @param  {String} oldValue Value before change
	 * @param  {String} newValue Value after change
	 * @memberof! Elements.elements.backbone2
	 * @instance
	 */
	attributeChangedCallback(attrName, oldValue, newValue) {
		if (this[attrName] !== newValue) {
			this[attrName] = newValue;
		}
	}
	/**
	 * Apply the properties saved in the constructor
	 * @param  {...Strings} properties Properties to restore
	 * @memberof! Elements.elements.backbone2
	 * @instance
	 */
	applyPriorProperties (...properties) {
		if (this.___propertyStore === null) {
			console.warn('It\'s too late to apply properties. Do this before connectedCallback');
			return;
		}
		for (let prop of properties) {
			if (this.___propertyStore.has(prop)) {
				this[prop] = this.___propertyStore.get(prop);
			}
		}
	}
	/**
	 * Apply the property saved in the constructor, or initial
	 * if the property was not present
	 * @param  {String} property Property to restore
	 * @param  {*} initial       What to set the property to if it was saved
	 * @memberof! Elements.elements.backbone2
	 * @instance
	 */
	applyPriorProperty (property, initial) {
		if (this.___propertyStore === null) {
			console.warn('It\'s too late to apply properties. Do this before connectedCallback');
			return;
		}
		if (this.___propertyStore.has(property)) {
			this[property] = this.___propertyStore.get(property);
		} else {
			this[property] = initial;
		}
	}
	/**
	 * Called when removed from the dom.
	 * Here for completion
	 * @memberof! Elements.elements.backbone2
	 * @instance
	 */
	disconnectedCallback () {}
};

export {initDefaultPreperties, backbone, backbone2};
