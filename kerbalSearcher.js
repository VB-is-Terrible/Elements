'use strict'

Elements.elements.KerbalSearcher = class extends Elements.elements.backbone {
	constructor () {
		super();
		const self = this;

		this.name = 'KerbalSearcher';
		this.update = null;
		this.maxResults = 5;
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		let updater = (e) => {
			self.display_results(self.search(searcher.value));
		};
		let searcher = template.querySelector('#nameInput');
		searcher.addEventListener('keyup', updater);

		for (let checkbox of template.querySelectorAll('input')) {
			checkbox.addEventListener('change', updater);
		}
		//Fancy code goes here
		shadow.appendChild(template);
	}
	prefix (string, nameList) {
		string = string.toLowerCase();
		let checker = (name) => {
			name = name.toLowerCase();
			if (name.indexOf(string) === 0) {
				return true;
			}
			return false;
		}
		let results = new Set();
		for (let name of nameList) {
			if (checker(name)) {
				results.add(name);
			}
		}
		return results;
	}
	fuzzy (string, nameList) {
		string = string.toLowerCase();
		let checker = (name) => {
			name = name.toLowerCase();
			let position = 0;
			for (let char of name) {
				if (char === string[position]) {
					position += 1;
				}
			}
			if (position === string.length) {
				return true;
			} else {
				return false;
			}
		}
		let results = new Set();
		for (let name of nameList) {
			if (checker(name)) {
				results.add(name);
			}
		}
		return results;
	}
	edit (string) {
		return [];
	}
	exact (string, nameList) {
		if (nameList.includes(string)) {
			return new Set([[]]);
		} else {
			return [];
		}
	}
	search (string) {
		let nameList = Array(...kdb.kerbals);
		let prefix = this.shadowRoot.querySelector('#prefix').checked;
		let fuzzy = this.shadowRoot.querySelector('#fuzzy').checked;
		let edit = this.shadowRoot.querySelector('#edit').checked;
		let result = new Set(this.exact(string, nameList));
		if (string === '') {
			return result;
		}
		if (prefix) {
			result = new Set([...result, ...this.prefix(string, nameList)]);
		}
		if (fuzzy) {
			result = new Set([...result, ...this.fuzzy(string, nameList)]);
		}
		if (edit) {
			result = new Set([...result, ...this.edit(string, nameList)]);
		}
		return result;
	}
	display_results (results) {
		this.emptyNodes();
		let itemHolder = this.shadowRoot.querySelector('elements-grid');
		let count = 1;
		if (this.update !== null) {
			cancelAnimationFrame(this.update);
		}
		this.update = requestAnimationFrame((e) => {
			itemHolder.rows = Math.min(results.size, 5);
			let iter = results.entries();
			for (let i = 0; i < results.size && i < 5; i++) {
				let name = iter.next().value[0];
				let display = kdb.getKerbal(name).makeDisplay ();
				display.slot = count.toString() + '-1';
				display.menuvisible = false;
				itemHolder.appendChild(display);
				let button = document.createElement('button');
				button.value = name;
				button.innerHTML = 'Edit Kerbal';
				button.class = "selection";
				button.slot = count.toString() + '-2';
				button.addEventListener('click', (e) => {
					this.editor(e);
				});
				itemHolder.appendChild(button);
				count += 1;
			}
			this.update = null;
		});
	}
	emptyNodes () {
		let holder = this.shadowRoot.querySelector('elements-grid');
		for (var i = holder.children.length - 1; i >= 0; i--) {
			holder.removeChild(holder.children[i]);
		}
	}
	editor (event) {
		let name = event.target.value;
		document.body.querySelector('elements-kerbal-editor').data = kdb.getKerbal(name);
	}
}

Elements.load('kerbalSearcherTemplate.html', Elements.elements.KerbalSearcher, 'elements-kerbal-searcher');
