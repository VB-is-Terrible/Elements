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
			console.log(entries);
			self.layout_switch(entries[0]);
		}, {
			root: null,
			rootMargin : '0px', // TODO: Add right margin
			threshold: [1],
		});
		this.__target = null;
		this.__layoutState = null;
	}
	connectedCallback () {
		super.connectedCallback();
		this.__IO.observe(this.shadowRoot.querySelector('#pseudoBody'));
	}
	disconnectedCallback () {
		super.disconnectedCallback();
		this.__IO.unobserve(this.shadowRoot.querySelector('#pseudoBody'));
	}
	/**
	 * Attach this hover above another element
	 * (Right now uses the parent div)
	 * @param {HTMLElement} target Thing to hover above
	 */
	offset_from (target) {
		this.__target = target;
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
	layout_switch (observation) {
		if (observation.intersectionRatio === 1) {
			this.__large_layout();
		} else {
			this.__small_layout();
		}
	}
	__large_layout () {
		let panel_rect = this.shadowRoot.querySelector('#pseudoBody').getBoundingClientRect();
		let top = 'calc(' + (-panel_rect.height).toString() + 'px - ' + VERTICAL_OFFSET + ')';
		this.__layoutState = 'large';
		this.style.top = top;
		this.style.position = 'absolute';
		this.style.left = '0px';
	}
	__small_layout () {
		let target_rect = this.__target.getBoundingClientRect();
		let panel_rect = this.shadowRoot.querySelector('#pseudoBody').getBoundingClientRect();
		let top = 'calc(' + target_rect.x.toString() + 'px - ' + panel_rect.height.toString() + 'px - ' + VERTICAL_OFFSET + ')';
		let left = 'calc( 100% - ' + panel_rect.width.toString() + 'px - ' + RIGHT_OFFSET + ')';
		this.__layoutState = 'small';
		this.style.top = top;
		this.style.position = 'fixed'
		this.style.left = left;
	}
}

Elements.load('kerbalPanelMenuTemplate.html', Elements.elements.KerbalPanelMenu, 'elements-kerbal-panel-menu');
}
