'use strict';

Elements.get('KDB');
{
const main = async () => {

await Elements.get('KDB');

/**
 * A kerbal display that just has the name in text
 * @augments Elements.elements.backbone
 * @augments BlankKerbalDisplayMixin
 * @implements KerbalDisplay
 * @type {Object}
 */
Elements.elements.KerbalDisplayText = class extends BlankKerbalDisplayMixin(Elements.elements.backbone) {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalDisplayText';
        this.__data = this.data || null;
        Object.defineProperty(this, 'data', {
                enumerable: true,
                configurable: false,
                get: () => {
                    return self.__data;
                },
                set: (value) => {
					if (self.__data !== null) {
						self.__data.removeDisplay(self);
					}
                    self.__data = value;
                    self.updateDisplay();
					if (value !== null) {
						value.addDisplay(self);
					}
                },
        });
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
        this.__main = template.querySelector('#main');
		shadow.appendChild(template);
	}
	connectedCallback () {
        super.connectedCallback();
        this.updateDisplay();
    }
    updateDisplay () {
        if (this.data === null) {
			this.__main.innerHTML = 'Miising Kerbal';
		} else {
			this.__main.innerHTML = Elements.nameSanitizer(this.data.name);
		}
    }
    delete () {
        this.remove();
    }
}

Elements.load('kerbalDisplayTextTemplate.html', Elements.elements.KerbalDisplayText, 'elements-kerbal-display-text');
};

main();
}
