'use strict';

Elements.get('kerbal-panel-menu');

/**
 * Footer on the bottom of the page
 * @type {Object}
 * @augments Elements.elements.backbone
 * @property {String} database Name of the database to look up
 */
Elements.elements.KerbalFooter = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalFooter';
		this.database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let save = template.querySelector('#save');
		let port = template.querySelector('#port');
		let menu = template.querySelector('#window');
		let panel = template.querySelector('#panel');

		let saver = (e) => {
			KerbalLink.save(self.database);
		};
		save.addEventListener('click', saver);

		let porter = (e) => {
			let element = KerbalLink.getUI(self.database, 'importer');
			if (element === null) {return;}
			if (element.hidden) {
				element.centre();
				element.showWindow();
			} else {
				element.hideWindow();
			}
		};
		port.addEventListener('click', porter);

		let mRAF = Elements.rafContext();
		let menuer = (e) => {
			if (panel.hidden === false) {
				panel.hidden = true;
			} else {
				panel.hidden = false;
			}
		};

		panel.addEventListener('maximise', (e) => {
			let element = KerbalLink.getUI(self.database, e.detail);
			if (element === null) {return;}
			if (element.hidden) {
				element.showWindow();
			} else {
				element.hideWindow();
			}
		});
		panel.addEventListener('centre', (e) => {
			let element = KerbalLink.getUI(self.database, e.detail);
			if (element === null) {return;}
			element.centre();
		});

		menu.addEventListener('click', menuer);
		shadow.appendChild(template);
	}
}

Elements.load(Elements.elements.KerbalFooter, 'elements-kerbal-footer');
