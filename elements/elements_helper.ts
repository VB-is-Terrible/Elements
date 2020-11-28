import type {backbone4} from './elements_backbone.js'

/**
 * Apply the properties saved in the constructor
 * @param  {...Strings} properties Properties to restore
 * @instance
 */
export function applyPriorProperties<O extends backbone4, K extends keyof O>(object: O, ...properties: Array<K & string>) {
        if (object.___propertyStore === null) {
                console.warn('It\'s too late to apply properties. Do this before connectedCallback');
                return;
        }
        for (let prop of properties) {
                if (object.___propertyStore.has(prop)) {
                        object[prop] = object.___propertyStore.get(prop);
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
export function applyPriorProperty<O extends backbone4, K extends keyof O>(object: O, property: string & K, initial: any) {
        if (object.___propertyStore === null) {
                console.warn('It\'s too late to apply properties. Do this before connectedCallback');
                return;
        }
        // Because inheritance, typescript can't figure this out :(
        if (object.___propertyStore.has(property)) {
                object[property] = object.___propertyStore.get(property);
        } else {
                object[property] = initial;
        }
}

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
export function setUpAttrPropertyLink<O, K extends keyof O, T extends {toString: () => string}> (
        object: backbone4 & O,
        property: K & string,
        initial: T | null = null,
        eventTrigger: (value: unknown) => void = (_value: unknown) => {},
        santizer: (value: unknown, old_value: T) => T = (value: any, _oldValue: any) => {return value;}) {

        const fail_message = 'Attr-Property must be in constructor.observedAttributes';
        //@ts-ignore
        console.assert((object.constructor.observedAttributes as unknown as Array<string>).includes(property), fail_message);

        let hidden: T;
        let getter = () => {return hidden;};
        let setter = (value: T) => {
                value = santizer(value, hidden);
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

/**
 * Desanitizes a string for HTML.
 * Used for UI output where escaping is not required, i.e. not HTML.
 * e.g. placeholder value set via js
 * @param  {String} string Sanitized string
 * @return {String}        Unsafe string
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
}
