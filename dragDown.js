'use strict';

//TODO: If empty, set display to none
/**
 * A drop down that presists.
 * Use slot='s1' for the element to go next to the arrow
 * @type {Object}
 * @property {Boolean} menuvisible Whether the drop down in toggled
 * @augments Elements.elements.backbone2
 */
Elements.elements.DragDown = class extends Elements.elements.backbone2 {
	constructor () {
		super();

		const self = this;
		this.name = 'DragDown';

        this.__menuVisible = true;

		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let button = template.querySelector('button');
		// Arrow function for this binding
		let buttonHandler = (event) => {
			self.menuvisible = !self.menuvisible;
		};
		button.addEventListener('click', buttonHandler);

		shadow.appendChild(template);

		this.applyPriorProperty('menuvisible', true);
	}
	get menuvisible () {
		return this.__menuVisible;
	}
	set menuvisible (open) {
		open = Elements.booleaner(open);
		if (open === this.menuvisible) {return;}
		let menu = this.shadowRoot.querySelector('div.down');
		let button = this.shadowRoot.querySelector('button');
		this.__menuVisible = open;
		if (this.attributeInit) {
			this.setAttribute('menuvisible', open);
		}
		requestAnimationFrame(() => {
			menu.style.display = open ? 'block' : 'none';
			button.innerHTML = open ? '&#x25b2;' : '&#x25bc;';
		});
	}
	/**
	 * Toggles whether the drop down is active
	 * @param  {Boolean} [open] Explicit state to change to
	 */
	toggleState (open) {
		if (open === undefined) {
			this.menuvisible =  !this.menuvisible;
		} else if (open === this.menuvisible)  {
			return;
		} else {
			this.menuvisible = open;
		}
	}
	static get observedAttributes () {
        return ['menuvisible'];
    }
}

Elements.load('dragDownTemplate.html', Elements.elements.DragDown, 'elements-drag-down');
