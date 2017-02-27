// Elements Bootloader
"use strict"


if (!("Elements" in window)) {
	window.Elements = {}
}

if (!(Elements.initalized === false)) {
	Elements.elements = {};

	Elements.elements.backbone = class extends HTMLElement {
		constructor () {
			super();

			this.getDict = {};
			this.setDict = {};

			this.attributeInit = false;
		}
		connectedCallback () {
			if (this.attributeInit === false)
			for (let func in this.getDict) {
				this.getDict[func]();
			}
			this.attributeInit = true;
		}
		attributeChangedCallback(attrName, oldValue, newValue) {
			if (attrName in this.setDict) {
				this.setDict[attrName](newValue);
			}
		}
	};

	Elements.connectedCallbackHelper = (object) => {
		if (object.attributeInit === false)
		for (let func in object.getDict) {
			object.getDict[func]();
		}
		object.attributeInit = true;
	};

	Elements.attributeChangedHelper = (object, attrName, OldValue, newValue) => {
		if (attrName in this.setDict) {
			this.setDict[attrName](newValue);
		}
	}

	Elements.getInitProperty = (object, property) => {
		return (() => {
			// If the attribute is been written to, it should be handled by
			// the attribute changed callback
			if (object.getAttribute(property) === null) {
				object.setAttribute(property, object[property])
			}
		});
	};

	Elements.setUpAttrPropertyLink = (object, property, inital=null,
			eventTrigger = () => {}) => {
		let hidden;
		let getter = () => {return hidden;};
		let setter = (value) => {
			hidden = value;
			if (object.attributeInit) {
				object.setAttribute(property, value);
			}
			eventTrigger(value);
		};

		Object.defineProperty(object, property, {
			enumerable: true,
			configurable: true,
			get: getter,
			set: setter
		});

		object.getDict[property] = Elements.getInitProperty(object, property);
		object.setDict[property] = setter;

		setter(inital);

		return {
			get: getter,
			set: setter
		};
	};


	Elements.initalized = true;
}
