export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

const SLOT_TEMPLATE = 'ContainerRotate-Stackable';
const template_promise = Elements.loadTemplate('container/rotate/stackableTemplate.html');

const mutation_options = {
	childList: true,
};

const swing_up = [
	{'transform':'translate(0px, 0px) rotateX(0deg)'},
	{'transform':'translate(0px, -50%) rotateX(90deg)'},
];

const swing_down = [
	{'transform':'translate(0px, 0px) rotateX(0deg)'},
	{'transform':'translate(0px, 50%) rotateX(-90deg)'},
];

const selector_re = /^s([0-9]*)/
/**
 * Shows children one at a time, with a nice rotation animation
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
export class ContainerRotate extends Elements.elements.backbone3 {
	constructor () {
		super();

		this.name = 'ContainerRotate';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._mo = new MutationObserver((mutationList, observer) => {
			this._mutation(mutationList, observer);
		});
		this._slot_count = 1;
		this._mo.observe(this, mutation_options);
		this._current = 's1';
		//Fancy code goes here
		shadow.appendChild(template);
		this.applyPriorProperties('current');
		this._rebuild();
	}
	connectedCallback () {
		super.connectedCallback();
	}
	disconnectedCallback () {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return ['current'];
	}
	/**
	 * Add slots to the inner stack until there are enough
	 * @private
	 */
	_build_slots () {
		let base = this.shadowQuery('div.stack_base');
		let has = base.childElementCount;
		let needed = this.childElementCount;
		for (let i = has; i < needed; i++) {
			let new_slot = Elements.importTemplate(SLOT_TEMPLATE);
			this._slot_count++;
			let slot_num = this._slot_count.toString();
			let slot = new_slot.querySelector('slot');
			slot.name = 's' + slot_num;
			let rotate = new_slot.querySelector('div.rotate');
			rotate.id = slot_num;
			requestAnimationFrame((e) => {
				base.append(new_slot);
			});
		}
	}
	/**
	 * Reassign the slots children are placed in, in case the order changed
	 * @private
	 */
	_reassign_slots () {
		let count = 0;
		for (let child of this.children) {
			count++;
			let slot_name = 's' + count.toString();
			requestAnimationFrame((e) => {
				child.slot = slot_name;
			});
		}
	}
	/**
	 * React to changes in the children
	 * @param  {MutationRecord[]} mutationList List of MutationRecord's of what happened
	 * @param  {MutationObserver} observer     The MutationObserver that saw these changes
	 * @private
	 */
	_mutation (mutationList, observer) {
		for (let record of mutationList) {
			// Track removal and insertion
		}
		console.log(mutationList);
		this._rebuild();
	}
	/**
	 * Rebuild the slot layout and assignment
	 * @private
	 */
	_rebuild () {
		this._build_slots();
		this._reassign_slots();
	}
	get current () {
		return this._current;
	}
	set current (new_value) {
		debugger;
		if (new_value === this._current) {
			return;
		}
		let index = this.constructor.parse_selector(new_value);
		if (index === -1) {
			return;
		}
		if (index >= this._slot_count) {
			console.log('index exceeded count');
		}
		let old_value = this._current;
		this._current = new_value;
		if (this.attributeInit) {
			this.setAttribute('current', new_value);
		}
	}
	/**
	 * Get the index of the refered child, -1 if invalid
	 * @param  {String} selector Selector to check
	 * @return {Integer}         The index of the child to show, else -1
	 */
	static parse_selector (selector) {
		let matches = selector_re.exec(selector);
		if (matches === null) {
			return -1;
		} else {
			return parseInt(matches[1]);
		}
	}
	_switch (old_index, new_index) {

	}
}

Elements.elements.ContainerRotate = ContainerRotate;

Elements.load(Elements.elements.ContainerRotate, 'elements-container-rotate', false, template_promise);
