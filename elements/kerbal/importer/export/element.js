'use strict';

Elements.get('tab-window', 'Kerbal_link');
{
const main = async () => {

await Elements.get('tab-window');
/**
 * Element that has a export window
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.tabbed
 */
Elements.elements.KerbalImporterExport = class extends Elements.elements.tabbed {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalImporterExport';
		this.database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let close = template.querySelector('#exportDismiss');
		close.addEventListener('click', (e) => {
			self.hideWindow();
		});

		let copy = template.querySelector('#exportCopy');
		let exportArea = template.querySelector('#exportArea');
		copy.addEventListener('click', (e) => {
			e.preventDefault();
			exportArea.select();
			document.execCommand('copy');
		});

		for (let input of template.querySelectorAll('input')) {
			if (input.type === 'text') {
				input.addEventListener('mousedown', (e) => {
					e.stopPropagation();
				});
			}
		}

		shadow.appendChild(template);
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
	showTab () {
		super.showTab();
		this.fillExport();
	}
}

Elements.load(Elements.elements.KerbalImporterExport, 'elements-kerbal-importer-export');
};

main();
}
