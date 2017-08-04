// Elements Bootloader
"use strict"


if (!("Elements" in window) || Elements.initalized === false) {
	/**
	 * Elements namespace
	 * @namespace
	 */
	window.Elements = {
		elements: {
			backbone: class extends HTMLElement {
				constructor () {
					super();

					this.getDict = {};
					this.setDict = {};

					this.attributeInit = false;
				}
				connectedCallback () {
					if (this.attributeInit === false){
						for (let func in this.getDict) {
							this.getDict[func]();
						}
					}
					this.attributeInit = true;
				}
				attributeChangedCallback(attrName, oldValue, newValue) {
					if (attrName in this.setDict && oldValue !== newValue) {
						this.setDict[attrName](newValue);
					}
				}
			}
		},
		loadedElements: new Set(),
		connectedCallbackHelper: (object) => {
			if (object.attributeInit === false) {
				for (let func in object.getDict) {
					object.getDict[func]();
				}
				object.attributeInit = true;
			}
		},
		attributeChangedHelper: (object, attrName, OldValue, newValue) => {
			if (attrName in this.setDict) {
				this.setDict[attrName](newValue);
			}
		},
		getInitProperty: (object, property) => {
			return (() => {
				// If the attribute is been written to, it should be handled by
				// the attribute changed callback
				if (object.getAttribute(property) === null) {
					object.setAttribute(property, object[property])
				}
			});
		},
		setUpAttrPropertyLink: (object, property, inital=null,
			   eventTrigger = () => {}) => {

			console.assert(object.constructor.observedAttributes.includes(property));
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
		},
		setUpSanitizedAttrPropertyLink: (object, property, inital=null,
			   eventTrigger = () => {},
			   santizer = (value, oldValue) => {return value}) => {

			console.assert(object.constructor.observedAttributes.includes(property));

			let hidden;
			let getter = () => {return hidden;};
			let setter = (value) => {
				value = santizer(value, hidden);
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
		},
		initalized: true,
		/**
		 * Async fetch a HTML file, load into document.head,
		 * then register custom element
		 * @param  {String} templateLocation [Location of HTML file containing template]
		 * @param  {HTMLElement} newElement       [New Custom HTMLElement]
		 * @param  {String} HTMLname         [Name to register HTMLElement as]
		 */
		load: (templateLocation, newElement, HTMLname) => {
			if (Elements.loadedElements.has(HTMLname)) {return;}

			let request = fetch(templateLocation).then(
				(response) => {
					if (response.ok) {
						return response.text();
					} else {
						throw new Error(response.url);
					}
				}
			).then(
				(template) => {
					document.head.innerHTML += template;
					window.customElements.define(HTMLname, newElement);
				}
			).catch((error) => {
				console.log("Failed network request for: " + error.message);
				Elements.loadedElements.delete(HTMLname);
			})
			Elements.loadedElements.add(HTMLname);
		},
		/**
		 * Imports node 'templateElements' + name
		 * @param  {String} name name of element
		 * @return {Node}      imported Node
		 */
		importTemplate: (name) => {
			return document.importNode(document.querySelector('#templateElements' + name), true).content;
		},
	}
}
