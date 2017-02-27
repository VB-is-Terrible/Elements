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
			for (func of this.getDict) {
				func();
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
		for (func of object.getDict) {
			func();
		}
		object.attributeInit = true;
	};

	Elements.attributeChangedHelper = (object, attrName, OldValue, newValue) => {
		if (attrName in this.setDict) {
			this.setDict[attrName](newValue);
		}
	}

	Elements.getInitProperty = (object, property) => {
		return () => {
			if (object.getAttribute(property) !== null) {
				object[property] = object.geteAttribute(property);
			}
		};
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
			extra(value);
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
