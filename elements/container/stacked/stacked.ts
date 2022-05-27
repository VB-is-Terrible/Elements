const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, applyPriorProperties} from '../../elements_backbone.js';
import {wait, get_border_box} from '../../elements_helper.js';

Elements.get(...recommends);
await Elements.get(...requires);

const mutation_options = {
	childList: true,
};

const selector_re = /^s([0-9]*)/

const SLOT_TEMPLATE = 'ContainerRotate-Stackable';
const template_promise = Elements.loadTemplate('container/rotate/stackableTemplate.html');

const ELEMENT_NAME = 'ContainerStacked';
/**
 * [ContainerStacked Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class ContainerStacked extends backbone4 {
	#mo: MutationObserver;
	#ro: ResizeObserver;
	#slot_count: number;
	#current: string;
	#rotate_divs: Map<string, HTMLDivElement>;
	#div_heights: Map<HTMLDivElement, number> = new Map();
	#div_widths: Map<HTMLDivElement, number> = new Map();
	#child_indexes: WeakMap<object, number>;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		this.#mo = new MutationObserver((mutationList, observer) => {
			this.#mutation(mutationList, observer);
		});
		this.#ro = new ResizeObserver((resizeList: ResizeObserverEntry[], observer: ResizeObserver) => {
			this.#resize(resizeList, observer)
		});
		this.#slot_count = 0;
		this.#current = 's1';
		this.#rotate_divs = new Map();
		this.#child_indexes = new WeakMap();
		this.#rotate_divs.set('s1', template.querySelector('div.rotate') as HTMLDivElement);

		this.#mo.observe(this, mutation_options);

		//Fancy code goes here
		shadow.appendChild(template);
		applyPriorProperties(this, 'current');
		this.#rebuild();
		requestAnimationFrame(() => {
			(this.shadowQuery('#rotate1') as HTMLDivElement).style.visibility = 'visible';
		});

	}
	/**
	 * Add slots to the inner stack until there are enough
	 * @private
	 */
	#build_slots () {
		let base = this.shadowQuery('div.stack_base') as HTMLDivElement;
		let has = Math.max(base.childElementCount);
		let needed = this.childElementCount;
		if (has === 0) {
			needed = Math.max(needed, 1);
		}
		for (let i = has; i < needed; i++) {
			let new_slot = Elements.importTemplate(SLOT_TEMPLATE);
			this.#slot_count++;
			let slot_num = this.#slot_count.toString();
			let slot = new_slot.querySelector('slot') as HTMLSlotElement;
			slot.name = 's' + slot_num;
			let rotate = new_slot.querySelector('div.rotate') as HTMLDivElement;
			rotate.id = 'rotate' + slot_num;
			this.#rotate_divs.set('s' + slot_num, rotate);
			let size_sensor = new_slot.querySelector('div.size_sensor') as HTMLDivElement;
			size_sensor.id = 'sense' + slot_num;
			this.#ro.observe(size_sensor);
			requestAnimationFrame(() => {
				base.append(new_slot);
			});
		}
	}
	static get observedAttributes() {
		return ['current'];
	}
	/**
	 * Reassign the slots children are placed in, in case the order changed
	 * @private
	 */
	#reassign_slots () {
		this.#child_indexes = new WeakMap();
		let count = 0;
		for (let child of this.children) {
			this.#child_indexes.set(child, count);
			count++;
			let slot_name = 's' + count.toString();
			requestAnimationFrame(() => {
				child.slot = slot_name;
			});
		}
	}
	/**
	 * React to changes in the children
	 * @param  {MutationRecord[]} mutationList List of MutationRecord's of what happened
	 * @param  {MutationObserver} _observer     The MutationObserver that saw these changes
	 * @private
	 */
	#mutation (mutationList: MutationRecord[], _observer: MutationObserver) {
		let current = ContainerStacked.#parse_selector(this.#current);
		current -= 1;
		let old_current = current;
		let offset = 0;
		let children = Array(...this.children);
		for (let record of mutationList) {
			for (let removal of record.removedNodes) {
				let location = this.#child_indexes.get(removal);
				if (location === undefined) {
					continue;
				}
				if (location < current) {
					offset++;
				}
				current -= offset;
			}
			for (const addition of record.addedNodes) {
				let location = children.indexOf(addition as Element);
				if (location === -1) {
					continue;
				}
				if (location <= current) {
					offset--;
				}
				current += offset;
			}
		}
		let new_slot = old_current - offset;
		if (new_slot > this.childElementCount) {
			new_slot = this.childElementCount;
		} else if (new_slot < 0) {
			new_slot = 0;
		}
		new_slot += 1;
		this.#rebuild();
		let new_slot_selector = 's' + new_slot.toString();
		this.#switch(this.#current, new_slot_selector);
		this.current = new_slot_selector;
	}
	/**
	 * Rebuild the slot layout and assignment
	 * @private
	 */
	#rebuild () {
		this.#build_slots();
		this.#reassign_slots();
	}
	get current () {
		return this.#current;
	}
	set current (new_value) {
		if (new_value === this.#current) {
			return;
		}
		let index = ContainerStacked.#parse_selector(new_value);
		if (index === -1) {
			return;
		}
		if (index > this.childElementCount) {
			console.log('index exceeded count');
		}
		let old_value = this.#current;
		this.#current = new_value;
		if (this.attributeInit) {
			this.setAttribute('current', new_value);
		}
		this.#switch_check(old_value, new_value);
	}
	/**
	 * Get the index of the refered child, -1 if invalid
	 * @param  {String} selector Selector to check
	 * @return {Integer}         The index of the child to show, else -1
	 */
	static #parse_selector (selector: string): number {
		let matches = selector_re.exec(selector);
		if (matches === null) {
			return -1;
		} else {
			return parseInt(matches[1]);
		}
	}
	/**
	 * Makes sure the children and slot states are consistent, then call _switch
	 * @param  {String} old_selector Selector for the current slot
	 * @param  {String} new_selector Selector for the slot to change to
	 * @private
	 */
	#switch_check (old_selector: string, new_selector: string) {
		if (this.#slot_count >= this.childElementCount) {
			this.#switch(old_selector, new_selector);
		} else {
			this.#switch_check_repeat(old_selector, new_selector);
		}
	}

	/**
	 * Makes sure the children and slot states are consistent, then call _switch
	 * @param  {String} old_selector Selector for the current slot
	 * @param  {String} new_selector Selector for the slot to change to
	 * @private
	 */
	async #switch_check_repeat (old_selector: string, new_selector: string) {
		await wait(0);
		if (this.#slot_count >= this.childElementCount) {
			this.#switch(old_selector, new_selector);
		} else {
			this.#switch_check_repeat(old_selector, new_selector);
		}
	}
	/**
	 * Switch between two slots, with a rotation animation
	 * @param  {String} old_selector Selector for the current slot
	 * @param  {String} new_selector Selector for the slot to change to
	 * @param  {Boolean} [no_animation=false] Skips any animations
	 * @private
	 */
	#switch (old_selector: string, new_selector: string) {
		let old_div = this.#rotate_divs.get(old_selector)!;
		let new_div = this.#rotate_divs.get(new_selector)!;
		requestAnimationFrame(() => {
			old_div.style.visibility = 'hidden';
			new_div.style.visibility = 'visible';
		});
	}
	/**
	 * Changes the displayed slot to the previous logical slot
	 */
	previous () {
		let index = ContainerStacked.#parse_selector(this.#current);
		let new_index = (index - 2 + this.childElementCount) % this.childElementCount;
		new_index += 1;
		this.current = 's' + new_index.toString();
	}
	/**
	 * Changes the displayed slot to the previous logical slot
	 */
	next () {
		let index = ContainerStacked.#parse_selector(this.#current);
		let new_index = index % this.childElementCount;
		new_index += 1;
		this.current = 's' + new_index.toString();
	}
	/**
	 * React to changes in the children
	 * @param  {ResizeObserverEntry[]} resizeList List of ResizeObserverEntry's of what happened
	 * @param  {ResizeObserver} _observer     The ResizeObserver that saw these changes
	 * @private
	 */
	#resize (resizeList: ResizeObserverEntry[], _observer: ResizeObserver) {
		for (let entry of resizeList) {
			let height = get_border_box(entry).blockSize;
			const width = entry.borderBoxSize[0].inlineSize;
			this.#div_heights.set(entry.target as HTMLDivElement, height);
			this.#div_widths.set(entry.target as HTMLDivElement, width);
		}
		const largest_height = Math.max(...this.#div_heights.values());
		const largest_width = Math.max(...this.#div_widths.values());
		const rule_height = 'div.rotate {min-height: ' + largest_height.toString() + 'px}';
		const rule_width = 'div.rotate {min-width: ' + largest_width.toString() + 'px}';
		let sheet = (this.shadowQuery('#rotate_expander') as HTMLStyleElement).sheet;
		if (sheet !== null) {
			if (sheet.cssRules.length === 2) {
				sheet.deleteRule(0);
				sheet.deleteRule(0);
			}
			sheet.insertRule(rule_height);
			sheet.insertRule(rule_width);
		}
		requestAnimationFrame(() => {
			this.style.setProperty('--innerWidth', `${largest_height}px`);
			this.style.setProperty('--innerWidth', `${largest_width}px`);
		});
	}
	/**
	 * Make the first child the displayed slot
	 */
	first () {
		this.current = 's0';
	}
	/**
	 * Make the last child the displayed slot
	 */
	last () {
		this.current = 's' + this.childElementCount.toString();
	}

}

export default ContainerStacked;

Elements.load(ContainerStacked, 'elements-container-stacked', true, template_promise);
