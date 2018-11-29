'use strict';
{
const downArrow = 'rotate(.5turn) translate(0px, -0.1em)';
const upArrow = 'rotate(0turn)';
const rightMidpoint = 'rotate(.25turn) translate(0px, -0.05em)';
const leftMidpoint = 'rotate(.75turn) translate(0px, -0.05em)';
/**
 * A drop down that presists.
 * Use slot='s1' for the element to go next to the arrow
 * @type {Object}
 * @property {Boolean} menuvisible Whether the drop down in toggled
 * @augments Elements.elements.backbone2
 */
Elements.elements.Dropdown = class extends Elements.elements.backbone2 {
	constructor () {
		super();

		const self = this;
		this.name = 'Dropdown';

		/**
		 * Current state of dropdown
		 * @type {Boolean}
		 * @private
		 */
		this.__menuVisible = true;
		/**
		 * Currently playing animations
		 * @type {Object}
		 * @property {?Animation} menu Animation for drop down
		 * @property {?Animation} arrow Animation for spinner arrow
		 * @private
		 */
		this.__animations = {
			menu: null,
			arrow: null,
		};
		/**
		 * Current animation state, either 'show' or 'hide'
		 * @type {?String}
		 * @private
		 */
		this.__animationState = null;
		/**
		 * Functions to fire on animation finish
		 * @type {Object}
		 * @property {?Function} menu Animation for drop down
		 * @property {?Function} arrow Animation for spinner arrow
		 * @private
		 */
		this.__animation_callback = {
			menu: null,
			arrow: null,
		};

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
		let arrow = this.shadowRoot.querySelector('div.arrow');
		this.__menuVisible = open;
		// let visiblity = open ? 'inherit' : 'hidden';
		let display = open ? 'block' : 'none';
		console.log(display);
		if (!this.attributeInit) {
			// No animation
			requestAnimationFrame((e) => {
				menu.style.display = display;
			});
			return;
		}
		this.setAttribute('menuvisible', open);

		// Calculate end states
		let state = open ? 'show' : 'hide';
		if (state === this.__animationState) {return;}
		let oldState = this.__animationState;
		this.__animationState = state;
		let arrowEnd = () => {
			requestAnimationFrame((e) => {
				arrow.style.transform = open ? downArrow: upArrow;
			});
			this.__animation_callback.arrow = null;
		};
		let menuEnd = () => {
			menu.style.display = display;
			this.__animation_callback.menu = null;
		};
		// Set end states
		// for reverse, the end states need to be replaced
		// for animation, end states need to be set
		this.__animation_callback.arrow = arrowEnd;
		this.__animation_callback.menu = menuEnd;

		// Check for reverse
		if (oldState !== null) {
			for (let element in this.__animations) {
				this.__animations[element].reverse();
			}
			return;
		}

		let arrowStates = {
			start: null,
			mid: null,
			end: null,
		};
		let menuStates = {
			start: null,
			end: null,
		};
		// Height is needed for menuStates
		// Refresh height
		{
		let states = [{
			transform: 'scaleY(0)',
		}, {
			transform: 'scaleY(1)',
		}];
		if (open) {
			[arrowStates.start, arrowStates.mid, arrowStates.end] = [upArrow, rightMidpoint, downArrow];
			[menuStates.start, menuStates.end] = states;
		} else {
			[arrowStates.start, arrowStates.mid, arrowStates.end] = [downArrow, leftMidpoint, upArrow];
			[menuStates.end, menuStates.start] = states;
		}
		}
		let setup = requestAnimationFrame((e) => {
			// menu.style.visibility = 'visible';
			menu.style.display = 'block';
		});
		// Animations
		let animation = arrow.animate([{
			transform: arrowStates.start,
		}, {
			transform: arrowStates.mid,
		}, {
			transform: arrowStates.end,
		}], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		animation.onfinish = () => {
			this.__animation_callback.arrow();
			this.__animationState = null;
			this.__animations.arrow = null;
		};
		this.__animations.arrow = animation;
		animation = menu.animate([menuStates.start, menuStates.end], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		animation.onfinish = () => {
			cancelAnimationFrame(setup);
			this.__animation_callback.menu();
			this.__animationState = null;
			this.__animations.menu = null;
		};
		this.__animations.menu = animation;
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

Elements.load(Elements.elements.Dropdown, 'elements-dropdown');
}
