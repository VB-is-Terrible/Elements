export const recommends = [];
export const requires = [];

import {Elements} from '../elements_core.js';
import {backbone4} from '../elements_backbone.js';
import {applyPriorProperty} from '../elements_helper.js'


const ELEMENT_NAME = 'Dropdown';

const upArrow = 'rotate(.5turn) translate(0px, -0.1em)';
const downArrow = 'rotate(0turn)';

const downToUp = [
        {
                transform: downArrow,
        }, {
                transform: 'rotate(.125turn) translate(0px, -0.025em)'
        }, {
                transform: 'rotate(.25turn) translate(0px, -0.05em)'
        }, {
                transform: 'rotate(.375turn) translate(0px, -0.075em)'
        }, {
                transform: upArrow
        }
];

const upToDown = [
        {
                transform: upArrow
        }, {
                transform: 'rotate(.625turn) translate(0px, -0.025em)'
        }, {
                transform: 'rotate(.75turn) translate(0px, -0.05em)'
        }, {
                transform: 'rotate(.875turn) translate(0px, -0.075em)'
        }, {
                transform: 'rotate(1turn)',
        }
];



type callback = () => void;

/**
 * A drop down that presists.
 * Use slot='s1' for the element to go next to the arrow
 * @type {Object}
 * @property {Boolean} menuvisible Whether the drop down in toggled
 * @augments Elements.elements.backbone2
 */
export class Dropdown extends backbone4 {
        private __menuVisible: boolean;
        private __animations: { menu: null | Animation; arrow: null | Animation; };
        private __animationState: null | string;
        private __animation_callback: { menu: null | callback; arrow: null | callback; };
	constructor () {
		super();

		const self = this;

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
		let template = Elements.importTemplate(ELEMENT_NAME);

		let button = template.querySelector('button') as HTMLButtonElement;
		// Arrow function for this binding
		let buttonHandler = () => {
			self.menuvisible = !self.menuvisible;
		};
		button.addEventListener('click', buttonHandler);

		shadow.appendChild(template);

		applyPriorProperty(this, 'menuvisible', true);
	}
	get menuvisible () {
		return this.__menuVisible;
	}
	set menuvisible (open) {
		open = Elements.booleaner(open);
		if (open === this.menuvisible) {return;}

		let menu = this.shadowQuery('div.down') as HTMLDivElement;
		let arrow = this.shadowQuery('div.arrow') as HTMLDivElement;
		this.__menuVisible = open;
		// let visiblity = open ? 'inherit' : 'hidden';
		let display = open ? 'block' : 'none';
		if (!this.attributeInit) {
			// No animation
			requestAnimationFrame(() => {
				menu.style.display = display;
			});
			return;
		}
		this.setAttribute('menuvisible', open.toString());

		// Calculate end states
		let state = open ? 'show' : 'hide';
		if (state === this.__animationState) {return;}
		let oldState = this.__animationState;
		this.__animationState = state;
		let arrowEnd = () => {
			requestAnimationFrame(() => {
				arrow.style.transform = open ? upArrow: downArrow;
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
                        this.__animations.arrow!.reverse();
                        this.__animations.menu!.reverse();
			return;
		}

		let arrowStates;
		let menuStates = {
			start: {},
			end: {},
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
                        arrowStates = downToUp;
			[menuStates.start, menuStates.end] = states;
		} else {
                        arrowStates = upToDown;
			[menuStates.end, menuStates.start] = states;
		}
		}

		let setup = requestAnimationFrame((e) => {
			// menu.style.visibility = 'visible';
			menu.style.display = 'block';
		});
		// Animations
		let animation = arrow.animate(arrowStates, {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		animation.onfinish = () => {
			this.__animation_callback.arrow!();
			this.__animationState = null;
			this.__animations.arrow = null;
		};
		this.__animations.arrow = animation;
		animation = menu.animate([menuStates.start, menuStates.end], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		animation.onfinish = () => {
			cancelAnimationFrame(setup);
			this.__animation_callback.menu!();
			this.__animationState = null;
			this.__animations.menu = null;
		};
		this.__animations.menu = animation;
	}
	/**
	 * Toggles whether the drop down is active
	 * @param  {Boolean} [open] Explicit state to change to
	 */
	toggleState (open: boolean | undefined) {
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

export default Dropdown;
Elements.elements.Dropdown = Dropdown;
Elements.load(Dropdown, 'elements-dropdown');
