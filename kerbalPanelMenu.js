'use strict';

{

const VERTICAL_OFFSET  = '1ex';
const RIGHT_OFFSET = '1ex';
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
		//Fancy code goes here
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
	}
	connectedCallback () {
		super.connectedCallback();
		this.__IO.observe(this.shadowRoot.querySelector('#sentinel'));
		// Skip the first frame, the css hasn't been layed out yet
		requestAnimationFrame((e) => {
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
		});
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		this.__IO.unobserve(this.shadowRoot.querySelector('#sentinel'));
	}
	layout_switch (observation) {
		if (observation.intersectionRatio === 1) {
			this.__large_layout();
		} else {
			this.__small_layout();
		}
	}
	__large_layout () {
		let main = this.shadowRoot.querySelector('#main');
		let sentinel = this.shadowRoot.querySelector('#sentinel');
		let panel_rect = main.getBoundingClientRect();
		let top = 'calc(' + (-panel_rect.height).toString() + 'px - ' + VERTICAL_OFFSET + ')';
		this.__layoutState = 'large';
		if ((panel_rect.width / window.innerWidth) < .95) {
			this.__max_width = Math.max(this.__max_width, panel_rect.width)
		}
		this.__rAF((e) => {
			main.style.top = top;
			main.style.position = 'absolute';
			main.style.left = 'auto';
			sentinel.style.width = this.__max_width.toString() + 'px';
			sentinel.style.minWidth = this.__max_width.toString() + 'px';
		});
	}
	__small_layout () {
		let main = this.shadowRoot.querySelector('#main');
		let target_rect = this.parentElement.getBoundingClientRect();
		let panel_rect = main.getBoundingClientRect();
		let top = 'calc(' + target_rect.y.toString() + 'px - ' + panel_rect.height.toString() + 'px - ' + VERTICAL_OFFSET + ')';
		let left = 'calc( 100% - ' + panel_rect.width.toString() + 'px - ' + RIGHT_OFFSET + ')';
		let sentinel = this.shadowRoot.querySelector('#sentinel');
		this.__layoutState = 'small';
		if ((panel_rect.width / window.innerWidth) < .95) {
			this.__max_width = Math.max(this.__max_width, panel_rect.width)
		}
		this.__rAF((e) => {
			main.style.top = top;
			main.style.position = 'fixed'
			main.style.left = left;
			sentinel.style.width = this.__max_width.toString() + 'px';
			sentinel.style.minWidth = this.__max_width.toString() + 'px';
		})
	}
	/**
	 * Get if the main panel is hidden
	 * @return {Boolean} Whether the UI is hidden
	 */
	get hidden () {
		let main = this.shadowRoot.querySelector('#main');
		let computed = getComputedStyle(main);
		if (computed.display === 'none' || computed.visibility === 'hidden') {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * Set the visibility of the main panel
	 * @param  {Boolean} value Value to set the visibility to
	 */
	set hidden (value) {
		let main = this.shadowRoot.querySelector('#main');
		if (value === false) {
			main.style.visibility = 'visible';
		} else {
			main.style.visibility = 'hidden';
		}
	}
}

Elements.load('kerbalPanelMenuTemplate.html', Elements.elements.KerbalPanelMenu, 'elements-kerbal-panel-menu');
}
