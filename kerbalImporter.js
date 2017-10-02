'use strict';
Elements.get('tabs', 'drag-element', 'kerbal-link');

{
const main = async () => {
await Elements.get('drag-element', 'kerbal-link');

/**
 * Element that has a import/export window
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.dragged
 */
Elements.elements.KerbalImporter = class extends Elements.elements.dragged {
	constructor () {
		super();
		const self = this;
		this.name = 'KerbalImporter';
		this.__active_tab = 'Import';
		this.database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
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
						self.fillExport();
						break;
					default:
						active = null;
				}
				if (active !== null) {
					active.style.display = 'block'
				} else {
					self.__active_tab = e.detail;
				}
			})
		};
		template.querySelector('elements-tabs').addEventListener('change', tabChange);

		let close = (e) => {
			self.hideWindow();
		}
		template.querySelector('#Close').addEventListener('click', close);

		let copy = template.querySelector('#exportCopy');
		let exportArea = template.querySelector('#exportArea');
		copy.addEventListener('click', (e) => {
			exportArea.focus();
			document.execCommand('copy');
		});
		shadow.appendChild(template);
	}
	/**
	 * Unhide this element
	 */
	showWindow () {
		super.showWindow();
		if (this.__active_tab == 'Export') {
			this.fillExport();
		}
	}
	/**
	 * Populate the export field
	 */
	fillExport () {
		let kdb = KerbalLink.get(this.database);
		let json = JSON.stringify(kdb);
		let exporter = this.shadowRoot.querySelector('#exportArea');
		let blob = new Blob([json], {type: 'text/plain'});
		let uri = URL.createObjectURL(blob);
		let link = this.shadowRoot.querySelector('#exportDownloadLink');
		link.href = uri;
		requestAnimationFrame((e) => {
			exporter.innerHTML = json;
			exporter.select();
		});
	}
}

Elements.load('kerbalImporterTemplate.html', Elements.elements.KerbalImporter, 'elements-kerbal-importer');
}
main();
}
