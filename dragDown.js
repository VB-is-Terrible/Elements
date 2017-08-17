'use strict'

//TODO: If empty, set display to none
Elements.elements.DragDown = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.name = 'DragDown';

		/**
		 * Toggles whether the drop down is active, without agruements toggles state
		 * @param  {Boolean} [open] Explicit state to change to
		 */
		this.menuVisible = true;

		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let button = template.querySelector('button');
		// Arrow function for this binding
		let buttonHandler = (event) => {
			this.toggleState();
		};
		button.addEventListener('click', buttonHandler);
		//Fancy code goes here
		shadow.appendChild(template);
	}
	/**
	 * Toggles whether the drop down is active, without agruements toggles state
	 * @param  {Boolean} [open] Explicit state to change to
	 */
	toggleState (open) {
		if (open === undefined) {
			open = !this.menuVisible;
		} else if (open === this.menuVisible)  {
			return;
		}
		let menu = this.shadowRoot.querySelector('div.down');
		let button = this.shadowRoot.querySelector('button');
		this.menuVisible = open;
		requestAnimationFrame(() => {
			menu.style.display = open ? 'block' : 'none';
			button.innerHTML = open ? '↑' : '↓';
		});
	}
}

Elements.load('dragDownTemplate.html', Elements.elements.DragDown, 'elements-drag-down');
