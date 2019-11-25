export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

const SLOT_TEMPLATE = 'ContainerRotate-Stackable';
const template_promise = Elements.loadTemplate('container/rotate/stackableTemplate.html');

const mutation_options = {
	childList: true,
};

const swing_top_up = [
	{'transform':'translate(0px, 0px) rotateX(0deg)'},
	{'transform':'translate(0px, -50%) rotateX(90deg)'},
];
const swing_bottom_up = [
	{'transform':'translate(0px, 50%) rotateX(-90deg)'},
	{'transform':'translate(0px, 0px) rotateX(0deg)'},
];
const swing_top_down = [
	{'transform':'translate(0px, -50%) rotateX(90deg)'},
	{'transform':'translate(0px, 0px) rotateX(0deg)'},
];
const swing_bottom_down = [
	{'transform':'translate(0px, 0px) rotateX(0deg)'},
	{'transform':'translate(0px, 50%) rotateX(-90deg)'},
];
const get_options = () => {
	return {
		fill: 'forwards',
		duration : Elements.animation.LONG_DURATION,
	};
}

const selector_re = /^s([0-9]*)/

const show_style = 'translate(0px, 0px) rotateX(0deg)';
const hide_style = 'translate(0px, 50%) rotateX(-90deg)';

/**
 * Shows children one at a time, with a nice rotation animation
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class ContainerRotate extends Elements.elements.backbone3 {
	constructor () {
		super();

		this.name = 'ContainerRotate';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._mo = new MutationObserver((mutationList, observer) => {
			this._mutation(mutationList, observer);
		});
		this._ro = new ResizeObserver((resizeList, observer) => {
			this._resize(resizeList, observer)
		});
		this._slot_count = 0;
		this._mo.observe(this, mutation_options);
		this._current = 's1';
		this._rotate_divs = new Map();
		this._div_sizes = new Map();
		this._child_indexes = new WeakMap();
		this._rotate_divs.set('s1', template.querySelector('div.rotate'));
		this._animation_next= '';
		this._in_animation = false;
		this._recalculate = true;
		shadow.appendChild(template);
		this.applyPriorProperties('current');
		this._rebuild();
		requestAnimationFrame((e) => {
			this.shadowQuery('#rotate1').style.transform = show_style;
		});
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
		let has = Math.max(base.childElementCount);
		let needed = this.childElementCount;
		if (has === 0) {
			needed = Math.max(needed, 1);
		}
		for (let i = has; i < needed; i++) {
			let new_slot = Elements.importTemplate(SLOT_TEMPLATE);
			this._slot_count++;
			let slot_num = this._slot_count.toString();
			let slot = new_slot.querySelector('slot');
			slot.name = 's' + slot_num;
			let rotate = new_slot.querySelector('div.rotate');
			rotate.id = 'rotate' + slot_num;
			this._rotate_divs.set('s' + slot_num, rotate);
			let size_sensor = new_slot.querySelector('div.size_sensor');
			size_sensor.id = 'sense' + slot_num;
			this._ro.observe(size_sensor);
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
		this._child_indexes = new WeakMap();
		let count = 0;
		for (let child of this.children) {
			this._child_indexes.set(child, count);
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
		let current = this.constructor.parse_selector(this._current);
		current -= 1;
		let old_current = current;
		let offset = 0;
		let children = Array(...this.children);
		for (let record of mutationList) {
			for (let removal of record.removedNodes) {
				let location = this._child_indexes.get(removal);
				if (location === undefined) {
					continue;
				}
				if (location < current) {
					offset++;
				}
				current -= offset;
			}
			for (let addition of record.addedNodes) {
				let location = children.indexOf(addition);
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
		this._rebuild();
		let new_slot_selector = 's' + new_slot.toString();
		this._switch(this._current, new_slot_selector, true);
		this.current = new_slot_selector;
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
		if (new_value === this._current) {
			return;
		}
		let index = this.constructor.parse_selector(new_value);
		if (index === -1) {
			return;
		}
		if (index > this.childElementCount) {
			console.log('index exceeded count');
		}
		let old_value = this._current;
		this._current = new_value;
		if (this.attributeInit) {
			this.setAttribute('current', new_value);
		}
		this._switch_check(old_value, new_value);
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
	/**
	 * Makes sure the children and slot states are consistent, then call _switch
	 * @param  {String} old_selector Selector for the current slot
	 * @param  {String} new_selector Selector for the slot to change to
	 * @private
	 */
	_switch_check (old_selector, new_selector) {
		if (this._slot_count >= this.childElementCount) {
			this._switch(old_selector, new_selector);
		} else {
			this._switch_check_repeat(old_selector, new_selector);
		}
	}

	/**
	 * Makes sure the children and slot states are consistent, then call _switch
	 * @param  {String} old_selector Selector for the current slot
	 * @param  {String} new_selector Selector for the slot to change to
	 * @private
	 */
	async _switch_check_repeat (old_selector, new_selector) {
		await Elements.wait(0);
		if (this._slot_count >= this.childElementCount) {
			this._switch(old_selector, new_selector);
		} else {
			this._switch_check_repeat(old_selector, new_selector);
		}
	}
	/**
	 * Switch between two slots, with a rotation animation
	 * @param  {String} old_selector Selector for the current slot
	 * @param  {String} new_selector Selector for the slot to change to
	 * @param  {Boolean} [no_animation=false] Skips any animations
	 * @private
	 */
	_switch (old_selector, new_selector, no_animation = false) {
		if (this._in_animation) {
			this._animation_next = new_selector;
			return;
		}
		let old_div = this._rotate_divs.get(old_selector);
		let new_div = this._rotate_divs.get(new_selector);
		let old_index = this.constructor.parse_selector(old_selector);
		let new_index = this.constructor.parse_selector(new_selector);
		let diffs = [new_index - old_index, old_index - new_index];
		// 0 is up, 1 is down
		let distances = diffs.map((i) => {return (i + this.childElementCount) % this.childElementCount});
		let up = distances[0] < distances[1] ? true : false;

		if (!this.attributeInit || no_animation) {
			this._in_animation = true;
			requestAnimationFrame((e) => {
				old_div.style.transform = hide_style;
				new_div.style.transform = show_style;
				this._in_animation = false;
			});
			return;
		}
		let animation;
		let options = get_options();
		if (up) {
			animation = old_div.animate(swing_top_up, options);
			new_div.animate(swing_bottom_up, options);
		} else {
			animation = old_div.animate(swing_bottom_down, options);
			new_div.animate(swing_top_down, options);
		}
		animation.onfinish = () => {this._post_animation(new_selector);};
		this._in_animation = true;
	}
	/**
	 * Changes the displayed slot to the previous logical slot
	 */
	previous () {
		let index = this.constructor.parse_selector(this._current);
		let new_index = (index - 2 + this.childElementCount) % this.childElementCount;
		new_index += 1;
		this.current = 's' + new_index.toString();
	}
	/**
	 * Changes the displayed slot to the previous logical slot
	 */
	next () {
		let index = this.constructor.parse_selector(this._current);
		let new_index = index % this.childElementCount;
		new_index += 1;
		this.current = 's' + new_index.toString();
	}
	/**
	 * React to changes in the children
	 * @param  {ResizeObserverEntry[]} resizeList List of ResizeObserverEntry's of what happened
	 * @param  {ResizeObserver} observer     The ResizeObserver that saw these changes
	 * @private
	 */
	_resize (resizeList, observer) {
		for (let entry of resizeList) {
			let height = entry.borderBoxSize ? entry.borderBoxSize.blockSize : entry.contentRect.height;
			this._div_sizes.set(entry.target, height);
		}
		let largest_height = Math.max(...this._div_sizes.values()) + 1;
		const rule = 'div.rotate {min-height: ' + largest_height.toString() + 'px}';
		let sheet = this.shadowQuery('#rotate_expander').sheet;
		if (sheet !== null) {
			if (sheet.rules.length === 1) {
				sheet.deleteRule(0);
			}
			sheet.insertRule(rule);
		}
		console.log(rule);
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
	/**
	 * Checks if there is another animation to play
	 * @private
	 */
	_post_animation (shown_selector) {
		this._in_animation = false;
		if (this._animation_next !== '') {
			let next = this._animation_next;
			this._animation_next = '';
			if (shown_selector !== next) {
				this._switch(shown_selector, next);
			}
		}
	}
}

export {ContainerRotate};
export default ContainerRotate;

Elements.load(ContainerRotate, 'elements-container-rotate', false, template_promise);
