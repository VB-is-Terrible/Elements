'use strict';

{

const VERTICAL_OFFSET  = '1ex';
const RIGHT_OFFSET = '1ex';
const RIGHT_EXTRA_INTERSECTION = 50;
/**
 * Maximise/Minimise event
 * @event Elements.elements.KerbalPanelMenu#maximise
 * @type {Object}
 * @property {String} detail Name of the thing to maximise/minimise
 */
/**
 * Centre event
 * @event Elements.elements.KerbalPanelMenu#centre
 * @type {Object}
 * @property {String} detail Name of the thing to centre
 */
/**
 * Panel for buttons to maximise/center things
 * @type {Object}
 * @fires Elements.elements.KerbalPanelMenu#centre
 * @fires Elements.elements.KerbalPanelMenu#maximise
 * @augments Elements.elements.backbone
 * @property {Boolean} hidden Whether the UI is hidden
 */
Elements.elements.KerbalPanelMenu = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalPanelMenu';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let divs = template.querySelectorAll('div.option');
		for (let div of divs) {
			let value = div.getAttribute('value');
			let detail = {detail: value};
			let max = div.querySelector('button.max');
			max.addEventListener('click', (e) => {
				let event = new CustomEvent('maximise', detail);
				self.dispatchEvent(event);
			});
			let centre = div.querySelector('button.centre');
			centre.addEventListener('click', (e) => {
				let event = new CustomEvent('centre', detail);
				self.dispatchEvent(event);
			});
		}
		shadow.appendChild(template);
		let body = this.shadowRoot.querySelector('#pseudoBody');
		this.__IO = new IntersectionObserver((entries) => {
			self.layout_switch(entries[0]);
		}, {
			root: null,
			rootMargin : '0px', // TODO: Add right margin
			threshold: [1],
		});
		this.__layoutState = 'large';
		this.__max_width = 0;
		this.__rAF = Elements.rafContext();
		/**
		 * The currently playing animation
		 * @type {Animation}
		 * @private
		 */
		this.__animation = null;
		/**
		 * Function to call on animation finish.
		 * Overriding Animation.onfinish doesn't cancel previous onfinishs (promises)
		 * so indirect the call to something that can be overridden
		 * @type {Function}
		 * @private
		 */
		this.__animationCallback = null;
		/**
		 * Current animation state, either 'show' or 'hide'
		 * @type {String}
		 * @private
		 */
		this.__animationState = null;
	}
	connectedCallback () {
		super.connectedCallback();
		this.__IO.observe(this.shadowRoot.querySelector('#sentinel'));
		switch (this.__layoutState) {
			case 'large':
			this.__large_layout();
			break;
			case 'small':
			this.__small_layout();
			break;
			default:
			this.__large_layout();
		}
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		this.__IO.unobserve(this.shadowRoot.querySelector('#sentinel'));
	}
	/**
	 * Switch the layout depending on screen size
	 * @param  {IntersectionObserverEntry} observation Observation of the sentinel element
	 * @private
	 */
	layout_switch (observation) {
		if (observation.intersectionRatio === 1) {
			this.__large_layout();
		} else {
			this.__small_layout();
		}
	}
	/**
	 * Layout using the large layout (centred above parent)
	 * @private
	 */
	__large_layout () {
		let main = this.shadowRoot.querySelector('#main');
		let sentinel = this.shadowRoot.querySelector('#sentinel');
		let panel_rect = main.getBoundingClientRect();
		let top = 'calc(' + (-panel_rect.height).toString() + 'px - ' + VERTICAL_OFFSET + ')';
		this.__layoutState = 'large';
		if ((panel_rect.width / window.innerWidth) < .95) {
			this.__max_width = Math.max(this.__max_width, panel_rect.width);
		}
		this.__rAF((e) => {
			main.style.top = top;
			main.style.position = 'absolute';
			main.style.left = 'auto';
			sentinel.style.width = (this.__max_width + RIGHT_EXTRA_INTERSECTION).toString() + 'px';
			sentinel.style.minWidth = (this.__max_width + RIGHT_EXTRA_INTERSECTION).toString() + 'px';
		});
	}
	/**
	 * Layout using the small layout (offset from right of screen, badly height adjusted)
	 * @private
	 */
	__small_layout () {
		let main = this.shadowRoot.querySelector('#main');
		let target_rect = this.parentElement.getBoundingClientRect();
		let panel_rect = main.getBoundingClientRect();
		let top = 'calc(' + target_rect.y.toString() + 'px - ' + panel_rect.height.toString() + 'px - ' + VERTICAL_OFFSET + ')';
		let left = 'calc( 100% - ' + panel_rect.width.toString() + 'px - ' + RIGHT_OFFSET + ')';
		let sentinel = this.shadowRoot.querySelector('#sentinel');
		this.__layoutState = 'small';
		if ((panel_rect.width / window.innerWidth) < .95) {
			this.__max_width = Math.max(this.__max_width, panel_rect.width);
		}
		this.__rAF((e) => {
			main.style.top = top;
			main.style.position = 'fixed';
			main.style.left = left;
			sentinel.style.width = (this.__max_width + RIGHT_EXTRA_INTERSECTION).toString() + 'px';
			sentinel.style.minWidth = (this.__max_width + RIGHT_EXTRA_INTERSECTION).toString() + 'px';
		});
	}
	get hidden () {
		if (this.__animationState !== null) {
			switch (this.__animationState) {
				case 'hide':
					return true;
					break;
				case 'show':
					return false;
					break;
				default:
					console.error('Bad animation state', this.__animationState);
			}
		}
		let main = this.shadowRoot.querySelector('#main');
		let computed = getComputedStyle(main);
		if (computed.display === 'none' || computed.visibility === 'hidden') {
			return true;
		} else {
			return false;
		}
	}
	set hidden (value) {
		let main = this.shadowRoot.querySelector('#main');
		if (value === false) {
			this.show()
		} else {
			this.hide();
		}
	}
	/**
	 * Show this panel, with animation
	 * @private
	 */
	show () {
		let main = this.shadowRoot.querySelector('#main');
		let body = this.shadowRoot.querySelector('#animateDiv');
		this.__animationState = 'show';
		// If the element is been shown, reverse it
		if (this.__animation !== null) {
			this.__animation.reverse();
			this.__animationCallback = null;
			return;
		}
		// Else, start a new animation
		requestAnimationFrame((e) => {
			main.style.visibility = 'visible';
		});
		this.__animation = body.animate([{
			opacity: 0,
			top: (Elements.animation.DROP_AMOUNT).toString() + 'px',
		}, {
			opacity: 1,
			top: '0px',
		}], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		this.__animation.onfinish = () => {
			this.animation_onfinish();
		};
	}
	/**
	 * Hide this panel, with animation
	 * @private
	 */
	hide () {
		let main = this.shadowRoot.querySelector('#main');
		let body = this.shadowRoot.querySelector('#animateDiv');
		this.__animationState = 'hide';
		// If the element is been shown, reverse it
		if (this.__animation !== null) {
			this.__animation.reverse();
			this.__animationCallback = () => {
				requestAnimationFrame((e) => {
					main.style.visibility = 'hidden';
				});
			};
			return;
		}
		// Else, start a new animation
		this.__animation = body.animate([{
			opacity: 1,
			top: '0px',
		}, {
			opacity: 0,
			top: (Elements.animation.DROP_AMOUNT).toString() + 'px',
		}], {
			duration: Elements.animation.MEDIUM_DURATION,
		});
		this.__animation.onfinish = () => {
			this.animation_onfinish();
		};
		this.__animationCallback = () => {
			requestAnimationFrame((e) => {
				main.style.visibility = 'hidden';
			});
		}
	}
	/**
	 * Run the animation onfinish callback, then reset animation state
	 * @private
	 */
	animation_onfinish () {
		if (this.__animationCallback !== null) {
			this.__animationCallback();
		}
		this.__animationCallback = null;
		this.__animation = null;
		this.__animationState = null;
	}
}

Elements.load('kerbalPanelMenuTemplate.html', Elements.elements.KerbalPanelMenu, 'elements-kerbal-panel-menu');
}
