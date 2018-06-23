'use strict';

Elements.get('tab-window', 'Kerbal_link');
{
const main = async () => {

await Elements.get('tab-window');
/**
 * Element that has a import window
 * @type {Object}
 * @property {String} database Name of the database to look up
 * @augments Elements.elements.tabbed
 */
Elements.elements.KerbalImporterImport = class extends Elements.elements.tabbed {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalImporterImport';
		this.database = this.database || 'default';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);


		let importArea = template.querySelector('#importArea');
		let importFile = template.querySelector('#importFile');
		let importCancel = template.querySelector('#importDismiss');
		let importAccept = template.querySelector('#accept');
		let importRaf = Elements.rafContext();
		this.__importRaf = importRaf;
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
			self.reset();
			this.hideWindow();
		});
		importAccept.addEventListener('click', (e) => {
			let success = self.consumeImport();
			if (success) {
				self.reset();
				self.hideWindow();
			}
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
	 * Reset the import tab
	 */
	fillImport () {

	}
	showTab () {
		super.showTab();
		this.fillImport();
	}
	/**
	 * Do a import!
	 * @return {Boolean} Whether an import happened successfully
	 */
	consumeImport () {
		let json = this.shadowRoot.querySelector('#importArea').value;
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
			return false;
		}
		this.showWarning(null);
		let name = 'db' + KerbalLink.counter.toString();
		let oldDB = this.database;
		KerbalLink.set(name, kdb);
		let UIs = KerbalLink.getUIAll(oldDB);
		for (let UIName of UIs) {
			let UI = KerbalLink.getUI(oldDB, UIName);
			UI.database = name;
			KerbalLink.removeUI(this.database, UIName);
			KerbalLink.registerUI(name, UIName, UI);
		}
		KerbalLink.setNextLoad(name);
		KerbalLink.save(name);
		KerbalLink.delete(oldDB);
		return true;
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
	/**
	 * Reset UI State
	 */
	reset () {
		let importArea = this.shadowRoot.querySelector('#importArea');
		let importFile = this.shadowRoot.querySelector('#importFile');
		this.__importRaf((e) => {
			importArea.innerHTML = '';
		});
		importFile.value = '';
		this.showWarning(null);
	}
}

Elements.load(Elements.elements.KerbalImporterImport, 'elements-kerbal-importer-import');
};

main();
}
