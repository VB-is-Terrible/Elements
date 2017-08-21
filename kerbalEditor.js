'use strict'

Elements.require('kerbal', 'grid', 'KDB');
Elements.await(() => {
Elements.elements.KerbalEditor = class extends Elements.elements.backbone {
	constructor () {
		super();

		this.name = 'KerbalEditor';
		let shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);
		let elements = {};
		let findElements = (...nameQSpairs) => {
			for (let pair of nameQSpairs) {
				elements[pair[0]] = template.querySelector(pair[1]);
			}
		};
		let applyEL = (elementName, event, callback) => {
			elements[elementName].addEventListener(event, callback);
		};
		findElements(
			['kerbal', 'elements-kerbal'],
			['nameInput', '#AnsName'],
			['typeInput', '#AnsText'],
			['updater', '#Done'],
			['AnsAddPlace', '#AnsAddPlace'],
			['AnsAddValue', '#AnsAddValue'],
			['AnsAddConfirm', '#AnsAddConfirm'],
			['AnsRemovePlace', '#AnsRemovePlace'],
			['AnsRemoveConfirm', '#AnsRemoveConfirm'],
			['warn', 'img.warn'],
		);
		Object.defineProperty(this, 'data', {
			enumerable: true,
			configurable: false,
			get: () => {
				return elements.kerbal.data;
			},
			set: (value) => {
				elements.kerbal.data = value;
			},
		});

		this.nameChanged = false;
		applyEL('nameInput', 'keyup', (e) => {
			let name = elements.nameInput.value;
			if (kdb.kerbals.has(name)) {
				elements.warn.style.display = 'block';
				elements.nameInput.style.color = 'red';
			} else {
				this.data.name = elements.nameInput.value;
				elements.warn.style.display = 'none';
				elements.nameInput.style.color = 'initial';
				this.nameChanged = true;
			}
		});
		applyEL('typeInput', 'change', (e) => {
			this.data.text = elements.typeInput.value;
		});
		applyEL('AnsAddConfirm', 'click', (e) => {
			let location = elements.AnsAddPlace.value;
			let value = parseInt(elements.AnsAddValue.value);
			this.data.removeJob(location, KNS.MAX_JOB_VALUE);
			this.data.addJob(location, value);
		});
		applyEL('AnsRemoveConfirm', 'click', (e) => {
			let location = elements.AnsRemovePlace.value;
			this.data.removeJob(location, KNS.MAX_JOB_VALUE);
		});
		applyEL('updater', 'click', (e) => {
			if (!(this.nameChanged && !(elements.nameInput.value === ''))) {
				return;
			}
			kdb.addKerbal(this.data);
			this.newKerbal();
		});
		this.elements = elements;
		shadow.appendChild(template);
	}
	newKerbal () {
		this.data = new KNS.Kerbal();
		this.data.displays.push(this.elements.kerbal)
		this.elements.kerbal.updateData();
		this.elements.kerbal.displayJobs();
		this.nameChanged = false;
		this.elements.nameInput.value = '';
		this.elements.typeInput.value = '';
		this.elements.AnsAddPlace.value = 'Kerbin';
		this.elements.AnsAddValue.value = 0;
		this.elements.AnsRemovePlace.value = '';
	}
}

Elements.load('kerbalEditorTemplate.html', Elements.elements.KerbalEditor, 'elements-kerbal-editor');
}, 'KDB');
