'use strict';
/**
 * Tab change event
 * @event Elements.elements.Tabs#change
 * @type {Event}
 * @property {String} detail value of the new tab
 */

/**
 * A tab display. Does not include actual tab switching
 * @type {Object}
 * @property {String} selected Current tab selected
 * @augments Elements.elements.backbone2
 * @fires Elements.elements.Tabs#change
 */
Elements.elements.Tabs = class extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'Tabs';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		this.__lastValue = null;
		this.__rAF = Elements.rafContext();
		this.mo = new MutationObserver(() => {
			self.resize();
		});
		this.config = {childList: true};
		shadow.appendChild(template);

		this.__setting = false;
		this.__temp = null;
		/**
		 * Concrete location of selected
		 * @type {String}
		 * @private
		 */
		this.__selected = null;
		this.applyPriorProperties('selected');

	}
	connectedCallback () {
		super.connectedCallback();
		this.resize();
		this.mo.observe(this, this.config);
		if (this.__temp !== null) {
			this.selected = this.__temp;
		}
	}
	disconnectedCallback () {
		this.mo.disconnect();
	}
	get selected () {
		return this.__selected;
	}
	set selected (value) {
		this.__selected = value;
		if (this.attributeInit) {
			this.setAttribute('selected', value);
		}
		if (this.__setting) return;
		if (this.attributeInit === false) {this.__temp = value; return;}
		let buttons = this.shadowRoot.querySelectorAll('button.tab');
		let result = null;
		for (let button of buttons) {
			if (value === button.firstElementChild.assignedNodes()[0].innerHTML) {
				result = button;
				break;
			}
		}
		this.__rAF(() => {
			this.clearState();
			if (result !== null) {
				result.classList.add('tab-selected');
			}
		});
	}
	/**
	 * Add/remove tabs to/from the element if required
	 */
	resize () {
		let size = this.childElementCount;
		let host = this.shadowRoot.querySelector('.tabs');
		let template = this.shadowRoot.querySelector('#tabTemplate');
		requestAnimationFrame((e) => {
			if (host.childElementCount < size) {
				for (let i = host.childElementCount; i < size; i++) {
					let newTab = document.importNode(template, true).content;
					let slot = newTab.querySelector('slot');
					slot.name = 's' + (i + 1).toString();
					let button = newTab.querySelector('button');
					let click = (e) => {
						this.__rAF(() => {
							this.clearState();
							button.classList.add('tab-selected');
						});
						let nodes = button.firstElementChild.assignedNodes();
						if (nodes.length === 0) {return;}
						let value = nodes[0].innerHTML;
						if (value !== this.__lastValue) {
							this.__setting = true;
							this.selected = value;
							this.__setting = false;
							this.__lastValue = value;
							let eventDetail = {detail: value};
							let event = new CustomEvent('change', eventDetail);
							this.dispatchEvent(event);
						}
					}
					button.addEventListener('click', click);
					host.appendChild(newTab);
					let nodes = button.firstElementChild.assignedNodes();
					if (nodes.length > 0) {
						if (nodes[0].innerHTML === this.selected) {
							this.__rAF(() => {
								this.clearState();
								button.classList.add('tab-selected');
							});
						}
					}
				}
			} else if (host.childElementCount > size) {
				for (let i = host.childElementCount - 1; i >= size; i--) {
					let tab = host.children[i];
					host.removeChild(tab);
				}
			}
		});
	}
	/**
	 * Reset all tabs to unselected state
	 */
	clearState () {
		let buttons = this.shadowRoot.querySelectorAll('button.tab');
		for (let button of buttons) {
			button.classList.remove('tab-selected');
		}
	}
	static get observedAttributes () {
		return ['selected'];
	}
}

Elements.load('tabsTemplate.html', Elements.elements.Tabs, 'elements-tabs');
