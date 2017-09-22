'use strict';

//TODO: If empty, set display to none
/**
 * A drop down that presists.
 * Use slot='s1' for the element to go next to the arrow
 * @type {Object}
 * @property {Boolean} menuvisible Whether the drop down in toggled
 */
Elements.elements.DragDown = class extends Elements.elements.backbone {
	constructor () {
		super();

		const self = this;
		this.name = 'DragDown';

        this.__menuVisible = true;


		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let button = template.querySelector('button');
		// Arrow function for this binding
		let buttonHandler = (event) => {
			self.menuvisible = !self.menuvisible;
		};
		button.addEventListener('click', buttonHandler);

		shadow.appendChild(template);

		let menuChange = (value) => {
			self.toggleState(value);
		};

		Elements.setUpAttrPropertyLink(this, 'menuvisible', true, menuChange, Elements.booleaner);
	}
	/**
	 * Toggles whether the drop down is active, without agruements toggles state
	 * @param  {Boolean} [open] Explicit state to change to
	 */
	toggleState (open) {
		if (open === undefined) {
			open = !this.__menuVisible;
		} else if (open === this.__menuVisible)  {
			return;
		}
		let menu = this.shadowRoot.querySelector('div.down');
		let button = this.shadowRoot.querySelector('button');
		this.__menuVisible = open;
		requestAnimationFrame(() => {
			menu.style.display = open ? 'block' : 'none';
			button.innerHTML = open ? '&#x25b2;' : '&#x25bc;';
		});
	}
	static get observedAttributes () {
        return ['menuvisible'];
    }
}

Elements.load('dragDownTemplate.html', Elements.elements.DragDown, 'elements-drag-down');
