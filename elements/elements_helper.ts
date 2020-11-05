import {backbone4} from './elements_backbone.js'

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
