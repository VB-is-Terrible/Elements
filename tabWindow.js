'use strict';

Elements.get('tabs', 'drag-element');
{
const main = async () => {

await Elements.get('drag-element');
/**
 * A window that has tabs. Note - tab names must be unique
 * @property {String} title The title displayed on the window
 * @property {String} tabs String of tab names in quotations, using backslashes to cancel e.g. '"Kerbal" "Destina\"tion"'
 * @property {String} selected Tab currently selected
 * @type {Object}
 * @augments Elements.elements.dragged2
 * @augments Elements.elements.backbone2
 * @fires Elements.elements.Tabs#change
 */
Elements.elements.TabWindow = class extends Elements.elements.dragged2 {
	constructor () {
		super();
		const self = this;

		this.name = 'TabWindow';
		this.__tabMap = new Map();
		this.__active = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let titleSpan = template.querySelector('#tabTitle');
		let tabs = template.querySelector('elements-tabs');
		let close = template.querySelector('#Close');
		shadow.appendChild(template);

		this.__title = '';
		this.__tabs = '';
		this.__selected = '';
		this.applyPriorProperties('title', 'tabs', 'selected');
		tabs.addEventListener('change', (e) => {
			self.selected = e.detail;
			let event = new CustomEvent('change', {detail: e.detail});
			this.dispatchEvent(event);
		});
		close.addEventListener('click', (e) => {
			self.hideWindow();
		});
	}
	get title () {
		return this.__title;
	}
	set title (value) {
		this.__title = value;
		if (this.attributeInit) {
			this.setAttribute('title', value);
		}
		let titleSpan = this.shadowRoot.querySelector('#tabTitle');
		requestAnimationFrame((e) => {
			titleSpan.innerHTML = value;
		});
	}
	get tabs () {
		return this.__tabs;
	}
	set tabs (value) {
		this.__tabs = value;
		if (this.attributeInit) {
			this.setAttribute('title', value);
		}
		this.reTab(value);
	}
	get selected () {
		return this.__selected;
	}
	set selected (value) {
		this.__selected = value;
		if (this.attributeInit) {
			this.setAttribute('selected', value);
		}
		let tabs = this.shadowRoot.querySelector('elements-tabs');

		tabs.selected = value;
		let active = this.__active;
		if (active !== null) {
			this.constructor.triggerNodeFunction(active, 'hideTab');
		}
		for (let div of this.__tabMap.values()) {
			div.style.display = 'none';
		}
		active = this.__tabMap.get(value);
		if (active !== undefined) {
			active.style.display = 'block';
			this.constructor.triggerNodeFunction(active, 'showTab');
			this.__active = active;
		}
	}
	/**
	 * Function to change the tabs
	 * @param  {Stirng} newValue New tabs string
	 * @private
	 */
	reTab (newValue) {
		let tabs = this.shadowRoot.querySelector('elements-tabs');
		let slots = this.shadowRoot.querySelector('#slots');
		let tabText = this.constructor.readTabs(newValue);
		requestAnimationFrame((e) => {
			tabs.innerHTML = '';
			for (let i = 0; i < tabText.length; i++) {
				let span = document.createElement('span');
				span.slot = 's' + (i + 1).toString();
				span.innerHTML = tabText[i];
				tabs.appendChild(span);
			}
			slots.innerHTML = '';
			for (let tab of tabText) {
				let div = document.createElement('div');
				let slot = document.createElement('slot');
				div.classList.add('slot');
				slot.name = tab;
				div.appendChild(slot);
				slots.appendChild(div);
				if (tab === this.selected) {
					div.style.display = 'block';
				}
				this.__tabMap.set(tab, div);
			}
		});
	}
	/**
	 * Method to trigger active tab's showTab method
	 */
	showWindowInform () {
		if (this.__active !== null) {
			this.constructor.triggerNodeFunction(this.__active, 'showTab');
		}
	}
	/**
	 * Method to trigger active tab's hideTab method
	 */
	hideWindowInform () {
		if (this.__active !== null) {
			this.constructor.triggerNodeFunction(this.__active, 'hideTab');
		}
	}
	/**
	 * Convert the value of tabs into an array of tab names
	 * @param  {String} tabString Value of tabs
	 * @return {String[]}         Array of tab names
	 * @private
	 */
	static readTabs (tabString) {
		let result = [];
		let current = '';
		let backSlash = false;
		let inString = false;
		let doubleMark = false;
		for (let letter of tabString) {
			if (inString) {
				switch (letter) {
					case '\\':
						if (backSlash) {
							current += '\\';
							backSlash = false;
						} else {
							backSlash = true;
						}
						break;
					case '\'':
						if (backSlash) {
							current += '\'';
						} else if (doubleMark) {
							current += '\'';
						} else {
							result.push(current);
							current = '';
							inString = false;
						}
						backSlash = false;
						break;
					case '\"':
						if (backSlash) {
							current += '\"';
						} else if (!doubleMark) {
							current += '\"';
						} else {
							result.push(current);
							current = '';
							inString = false;
						}
						backSlash = false;
						break;
					default:
						backSlash = false;
						current += letter;
				}
			} else {
				switch (letter) {
					case '\'':
						inString = true;
						doubleMark = false;
						break;
					case '\"':
						inString = true;
						doubleMark = true;
						break;
				}
				backSlash = false;
			}
		}
		return result;
	}
	/**
	 * Attempts to fire a method on the element in the slot
	 * @param  {HTMLElement} slotContainer A HTMLElement that has the slot as the firstElementChild
	 * @param  {String} functionName  Name of the method to call
	 * @private
	 */
	static triggerNodeFunction (slotContainer, functionName) {
		let nodes = slotContainer.firstElementChild.assignedNodes();
		if (nodes.length > 0) {
			let content = nodes[0];
			if (typeof content.showTab === 'function') {
				content[functionName]();
			}
		}
	}
	static get observedAttributes () {
		return ['title', 'selected', 'tabs'];
	}
}

/**
 * Implements commonly used methods for things in tabs
 * @implements Draggable
 * @property {Boolean} hidden Wheter this tab window is hidden
 * @augments Elements.elements.dragged
 * @type {Object}
 */
Elements.elements.tabbed = class extends Elements.elements.dragged {
	/**
	 * Fired when the tab is hidden
	 */
	hideTab () {}
	/**
	 * Fired when the tab is shown
	 */
	showTab () {}
}


/**
 * Implements commonly used methods for things in tabs
 * @implements Draggable
 * @property {Boolean} hidden Wheter this tab window is hidden
 * @augments Elements.elements.dragged2
 * @type {Object}
 */
Elements.elements.tabbed2 = class extends Elements.elements.dragged2 {
	/**
	 * Fired when the tab is hidden
	 */
	hideTab () {}
	/**
	 * Fired when the tab is shown
	 */
	showTab () {}
}

Elements.load('tabWindowTemplate.html', Elements.elements.TabWindow, 'elements-tab-window');
};

main();
}
