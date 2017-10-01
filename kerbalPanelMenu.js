'use strict';

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
 * [KerbalPanelMenu description]
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
	/**
	 * Attach this hover above another element
	 * (Right now uses the parent div)
	 * @param {HTMLElement} target Thing to hover above
	 */
	offset_from (target) {
		requestAnimationFrame((e) => {
			let target_rect = target.getBoundingClientRect();
			let panel_rect = this.shadowRoot.querySelector('#pseudoBody').getBoundingClientRect();
			let top = 'calc(' + (-panel_rect.height).toString() + 'px - 1em)';
			this.style.top = top;

		});
	}
	}
}

Elements.load('kerbalPanelMenuTemplate.html', Elements.elements.KerbalPanelMenu, 'elements-kerbal-panel-menu');
