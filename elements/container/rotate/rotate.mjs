export const recommends = [];
export const requires = [];

import {Elements} from '../../Elements.mjs';

const SLOT_TEMPLATE = 'ContainerRotate-Stackable';
const template_promise = Elements.loadTemplate('container/rotate/stackableTemplate.html');

const mutation_options = {
	childList: true,
};

/**
 * [ContainerRotate Description]
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
		this._slot_count = 0;
		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback () {
		super.connectedCallback();
		this._build_slots();
		this._reassign_slots();
		this._mo.observe(this, mutation_options);
	}
	disconnectedCallback () {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return [];
	}
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
	_mutation (mutationList, observer) {

	}
}

Elements.elements.ContainerRotate = ContainerRotate;

Elements.load(Elements.elements.ContainerRotate, 'elements-container-rotate', false, template_promise);
