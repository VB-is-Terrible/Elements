'use strict';

Elements.get('KDB', 'kerbal');
{
const main = async () => {

await Elements.get('KDB');
/**
 * A GroupDisplay that just shows the kerbals in the group
 * @implements GroupDisplay
 * @property {KNS.Group} data The group to display
 */
Elements.elements.KerbalGroupDisplayKerbal = class extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;
		this.name = 'KerbalGroupDisplayKerbal';
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
		}
	}
	/**
	 * Add a kerbal to the display
	 * @param {KNS.Kerbal} kerbal Kerbal to display
	 */
	addKerbal (kerbal) {
        let body = this.shadowRoot.querySelector('#pseudoBody');
        if (this.displays.has(kerbal)) {return;}
        let display = document.createElement('elements-kerbal');
		display.menuvisible = false;
		display.data = kerbal;
		this.displays.set(kerbal, display);
		requestAnimationFrame((e) => {
			body.appendChild(display);
		});
    }
	/**
	 * Remove all displayed kerbals
	 * @private
	 */
	emptyNodes () {
		for (let kerbal of this.displays.keys()) {
			this.deleteKerbal(kerbal);
		}
	}
	/**
	 * Display all kerbals in the group
	 * @private
	 */
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
	/**
	 * Update the name, text of the group
	 */
	updateData () {}
}

Elements.load('kerbalGroupDisplayKerbalTemplate.html', Elements.elements.KerbalGroupDisplayKerbal, 'elements-kerbal-group-display-kerbal');
};

main();
}
