'use strict';

Elements.get('KDB', 'kerbal-display_text');
{
const main = async () => {

await Elements.get('KDB');
/**
 * @implements GroupDisplay
 * @property {KNS.Group} data The group to display
 */
Elements.elements.KerbalGroupDisplayKerbal_text = class extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;
		this.name = 'KerbalGroupDisplayKerbalText';
		/**
		 * The KNS.Group been displayed
		 * @private
		 * @type {KNS.Group}
		 */
        this.__data = this.data || null;
        this.displays = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		shadow.appendChild(template);
		this.applyPriorProperties('data');
	}
	get data () {
		return this.__data;
	}
	set data (value) {
		if (this.__data !== null) {
			this.__data.removeDisplay(this);
		}
		this.emptyNodes();
		this.__data = value;
		if (this.__data !== null) {
			this.__data.addDisplay(this);
			this.populateDisplay();
			this.updateData();
		}
	}
	/**
	 * Add a kerbal to the display
	 * @param {KNS.Kerbal} kerbal Kerbal to display
	 */
	addKerbal (kerbal) {
        let body = this.shadowRoot.querySelector('#kerbals');
        if (this.displays.has(kerbal)) {return;}
        let display = document.createElement('elements-kerbal-display_text');
		display.data = kerbal;
		this.displays.set(kerbal, display);
		requestAnimationFrame((e) => {
			body.appendChild(display);
		});
    }
	emptyNodes () {
		for (let kerbal of this.displays.keys()) {
			this.deleteKerbal(kerbal);
		}
	}
	populateDisplay () {
		for (let kerbal of this.data.kerbals) {
			this.addKerbal(kerbal);
		}
	}
	/**
	 * Delete a kerbal's display
	 * @param  {KNS.Kerbal} kerbal Kerbal to remove
	 */
	deleteKerbal (kerbal) {
		let display = this.displays.get(kerbal);
		if (display !== undefined) {
			requestAnimationFrame((e) => {
				display.remove();
			});
			display.data = null;
		}
	}
	updateData () {
		let name = this.shadowRoot.querySelector('#name');
		let text = this.shadowRoot.querySelector('#text');
		name.innerHTML = Elements.nameSanitizer(this.data.name);
		text.innerHTML = Elements.nameSanitizer(this.data.text);
	}
}

Elements.load(Elements.elements.KerbalGroupDisplayKerbal_text, 'elements-kerbal-group-display-kerbal_text');
};

main();
}
