// export const recommends = [];
// export const requires = [];
// export
//
//
// export const init = async (Elements) => {
//
// }
//
import * as t from './testbed4.mjs';
t.setTest('something');
t.obj.a = 'hi';

const excludedProperties = new Set(['attributeInit', '___propertyStore']);
const defaultProperties = new Set();

const initDefaultPreperties = function () {
	let Sentinel = class extends HTMLElement {};
	customElements.define('black-hole-sentinel', Sentinel);
	let base = new Sentinel();
	for (let property in base) {
		defaultProperties.add(property);
	}
}

initDefaultPreperties();

console.log(defaultProperties);
