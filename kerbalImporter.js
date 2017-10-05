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
						self.fillImport();
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
		template.querySelector('#exportDismiss').addEventListener('click', close);

		let copy = template.querySelector('#exportCopy');
		let exportArea = template.querySelector('#exportArea');
		copy.addEventListener('click', (e) => {
			exportArea.focus();
			document.execCommand('copy');
		});

		let importArea = template.querySelector('#importArea');
		let importFile = template.querySelector('#importFile');
		let importCancel = template.querySelector('#importDismiss');
		let importAccept = template.querySelector('#accept');
		let importRaf = Elements.rafContext();
		importFile.addEventListener('change', (e) => {
			if (e.target.files.length < 1) {
				return;
			}
			let file = e.target.files[0];
			let reader = new FileReader(file);
			reader.onload = (e) => {
				let json = e.target.result;
				importRaf((e) => {
					importArea.innerHTML = json;
				});
			}
			reader.readAsText(file);
		});
		importCancel.addEventListener('click', (e) => {
			importRaf((e) => {
				importArea.innerHTML = '';
			});
			close(e);
		});


		shadow.appendChild(template);
	}

	/**
	 * Unhide this element
	 */
	showWindow () {
		super.showWindow();
		if (this.__active_tab === 'Export') {
			this.fillExport();
		} else if (this.__active_tab === 'Import') {
			this.fillImport();
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
	/**
	 * Reset the import tab
	 */
	fillImport () {

	}
	consumeImport () {
		let json = this.shadowRoot.querySelector('#importArea');
		let kdb;
		try {
			kdb = KDB.fromJSON(json);
		} catch (e) {
			if (e instanceof SyntaxError) {
				this.showWarning('Invalid input - not JSON');
			} else if (e instanceof KNS.KDBParseError) {
				this.showWarning('Invalid input - not a database');
			} else {
				this.showWarning('Unknown Error');
			}
			return;
		}
		this.showWindow()
		let name = 'db' + KerbalLink.counter.toString();
		KerbalLink.counter += 1;
		KerbalLink.set(name, kdb);
		let UIs = KerbalLink.getUIAll(this.database);
		for (let UIName of UIs) {
			let UI = KerbalLink.getUI(this.database, UIName);
			UI.database = name;
			KerbalLink.removeUI(this.database, UIName);
		}
	}
	/**
	 * Show a error message for invalid imports
	 * @param  {?String} [errorMessage=null] Error message to show. null to hide the warning
	 */
	showWarning (errorMessage = null) {
		let warning = this.shadowRoot.querySelector('#invalidImport');
		let warningText = warning.querySelector('#invalidImportText');
		requestAnimationFrame((e) => {
			if (errorMessage === null) {
				warning.style.display = 'none';
			} else {
				warning.style.display = 'flex';
				warningText.innerHTML = errorMessage;
			}
		});
	}
}

Elements.load('kerbalImporterTemplate.html', Elements.elements.KerbalImporter, 'elements-kerbal-importer');
}
main();
}
