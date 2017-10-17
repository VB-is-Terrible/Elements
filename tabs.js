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
 * @augments Elements.elements.backbone
 * @fires Elements.elements.Tabs#change
 */
Elements.elements.Tabs = class extends Elements.elements.backbone {
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
		})
		this.config = {childList: true};
		shadow.appendChild(template);

		this.__setting = false;
		this.__temp = null;
		let selector = (value) => {
			if (self.__setting) return;
			if (self.attributeInit === false) {self.__temp = value; return;}
			let buttons = self.shadowRoot.querySelectorAll('button.tab');
			let result = null;
			for (let button of buttons) {
				if (value === button.firstElementChild.assignedNodes()[0].innerHTML) {
					result = button;
					break;
				}
			}
			self.__rAF(() => {
				self.clearState();
				if (result !== null) {
					result.classList.add('tab-selected');
				}
			});
		};
		Elements.setUpAttrPropertyLink(this, 'selected', null,
		selector);

	}
	connectedCallback () {
		super.connectedCallback();
		this.resize();
		this.mo.observe(this, this.config);
		if (this.__temp !== null) {
			this.selected = this.__temp;
		}
	}
	/**
	 * Add more tabs to the element if required
	 */
	resize () {
		let size = this.childElementCount;
		let host = this.shadowRoot.querySelector('.tabs');
		let template = this.shadowRoot.querySelector('#tabTemplate');
		if (host.childElementCount < size) {
			for (let i = host.childElementCount; i < size; i++) {
				let newTab = document.importNode(template, true).content;
				let slot = newTab.querySelector('slot');
				slot.name = 's' + (i + 1).toString();
				let button = newTab.querySelector('button');
				let click = (e) => {
					// debugger;
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
						})
					}
				}
			}
		}
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
