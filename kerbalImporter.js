'use strict';
Elements.get('tabs', 'drag-element', 'kerbal-link');

{
const main = async () => {
await Elements.get('drag-element', 'kerbal-link');
Elements.elements.KerbalImporter = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;
		this.name = 'KerbalImporter';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let tabs = [
			template.querySelector('#import'),
			template.querySelector('#export'),
		];
		let tabChange = (e) => {
			requestAnimationFrame(() => {
				for (let tab of tabs) {
					tab.style.display = 'none';
				}
				let active;
				switch (e.detail) {
					case 'Import':
					active = tabs[0];
					break;
					case 'Export':
					active = tabs[1];
					break;
					default:
					active = null;
				}
				if (active !== null) {
					active.style.display = 'block'
				}

			})
		};
		template.querySelector('elements-tabs').addEventListener('change', tabChange);

		let close = (e) => {
			self.hideWindow();
		}
		template.querySelector('#Close').addEventListener('click', close);
		// TODO: Actually implement import/export
		shadow.appendChild(template);
	}
	hideWindow () {
		this.parentElement.style.display = 'none';
	}
}

Elements.load('kerbalImporterTemplate.html', Elements.elements.KerbalImporter, 'elements-kerbal-importer');
}
main();
}
