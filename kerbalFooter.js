'use strict';

Elements.get('kerbal-panel-menu');

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
			let element = KerbalLink.getUI(self.database + '-' + 'importer');
			if (element === null) {return;}
			element.centre();
			element.showWindow();
		};
		port.addEventListener('click', porter);

		let mRAF = Elements.rafContext();
		let menuer = (e) => {
			const style = getComputedStyle(panel);
			if (style.visibility === 'visible') {
				panel.style.visibility = 'hidden';
			} else {
				// let rect = e.target.getBoundingClientRect();
				let panelRect = panel.getBoundingClientRect();
				let top = - (panelRect.height / 2);
				panel.style.visibility = 'visible';
				panel.offset_from(e.target);
			}
			console.log(e);
		};

		panel.addEventListener('maximise', (e) => {
			let element = KerbalLink.getUI(self.database + '-' + e.detail);
			if (element === null) {return;}
			if (element.hidden) {
				element.showWindow();
			} else {
				element.hideWindow();
			}
		});
		panel.addEventListener('centre', (e) => {
			let element = KerbalLink.getUI(self.database + '-' + e.detail);
			if (element === null) {return;}
			element.centre();
		});

		menu.addEventListener('click', menuer);
		shadow.appendChild(template);
	}
}

Elements.load('kerbalFooterTemplate.html', Elements.elements.KerbalFooter, 'elements-kerbal-footer');
