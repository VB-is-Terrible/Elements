'use strict';

Elements.get('KDB', 'kerbal-display-text');
{
const main = async () => {

await Elements.get('KDB');
/**
 * @implements GroupDisplay
 *
 */
Elements.elements.KerbalGroupDisplayKerbalText = class extends Elements.elements.backbone {
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
		Object.defineProperty(this, 'data' {
			enumerable: true,
			configurable: false,
			get: () => {
				return self.__data;
			},
			set: (value) => {
				if (self.__data !== null) {
					self.__data.removeDisplay(this);
				}
				self.emptyNodes();
				self.__data = value;
				if (self.__data !== null) {
					self.__data.addDisplay(this);
					self.populateDisplay();
				}
			},
		})
        this.displays = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		shadow.appendChild(template);
	}
	/**
	 * Add a kerbal to the display
	 * @param {KNS.Kerbal} kerbal Kerbal to display
	 */
	addKerbal (kerbal) {
        let body = this.shadowRoot.querySelector('#pseudoBody');
        if (this.displays.has(kerbal)) {return;}
        let display = document.createElement('elements-kerbal-display-text');
		display.data = kerbal;
		this.displays.set(kerbal, display);
		body.appendChild(display);
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
			display.remove();
			display.data = null;
		}
	}
	updateData () {

	}
}

Elements.load('kerbalGroupDisplayKerbalTextTemplate.html', Elements.elements.KerbalGroupDisplayKerbalText, 'elements-kerbal-group-display-kerbal-text');
};

main();
}
