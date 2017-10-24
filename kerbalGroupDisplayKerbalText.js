'use strict';

Elements.get('KDB');
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
        this.data = this.data || null;
        this.displays = new Map();
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		shadow.appendChild(template);
	}
	addKerbal (kerbal) {
        let body = this.shadowRoot.querySelector('#pseudoBody');
        if (this.displays.has(kerbal.name) {return;}
        let display = document.createElement('');
    }
}

Elements.load('kerbalGroupDisplayKerbalTextTemplate.html', Elements.elements.KerbalGroupDisplayKerbalText, 'elements-kerbal-group-display-kerbal-text');
};

main();
}
