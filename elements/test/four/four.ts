const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, applyPriorProperties, applyPriorProperty} from '../../elements_backbone.js';
import {} from '../../elements_helper.js'

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'TestFour';
/**
 * [TesterTest Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class TestFour extends backbone4 {
	test!: string;
	derp = 'herp';
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		console.log('v4 Working!');
		//Fancy code goes here
		applyPriorProperty(this, 'test', 'Hello!');
		applyPriorProperties(this, 'derp')
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return ['test'];
	}
	attributeChangedCallback<K extends keyof TestFour>(attrName: K & string, oldValue: string, newValue: string) {
		console.log(attrName + ' changing from ' + oldValue + ' to ' + newValue);
	}
}

console.log('adfsklj');

export default TestFour;

Elements.load(TestFour, 'elements-test-four');
