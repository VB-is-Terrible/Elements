// Elements Bootloader
'use strict'


if (!('Elements' in window) || Elements.initalized === false) {
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
				disconnectedCallback () {

				}
			}
		},
		loadedElements: new Set(),
		loadingElements: new Set(),
		requestedElements: new Set(),
		connectedCallbackHelper: (object) => {
			console.warn('Using deprecated function connectedCallbackHelper');
			if (object.attributeInit === false) {
				for (let func in object.getDict) {
					object.getDict[func]();
				}
				object.attributeInit = true;
			}
		},
		attributeChangedHelper: function (object, attrName, OldValue, newValue) {
			console.warn('Using deprecated function attributeChangedHelper');
			if (attrName in this.setDict) {
				this.setDict[attrName](newValue);
			}
		},
		getInitProperty: function (object, property) {
			return (() => {
				// If the attribute is been written to, it should be handled by
				// the attribute changed callback
				if (object.getAttribute(property) === null) {
					object.setAttribute(property, object[property]);
				}
			});
		},
		setUpAttrPropertyLink: function (object, property, inital=null,
			   eventTrigger = () => {},
			   santizer = (value, oldValue) => {return value;}) {

			console.assert(object.constructor.observedAttributes.includes(property));

			let hidden;

			if (object[property] !== undefined) {
				inital = object[property];
			}
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

			object.getDict[property] = this.getInitProperty(object, property);
			object.setDict[property] = setter;

			setter(inital);

			return {
				get: getter,
				set: setter
			};
		},
		setUpSanitizedAttrPropertyLink: function (...args) {
			console.warn('Using deprecated function setUpSanitizedAttrPropertyLink, it has now been merged with setUpAttrPropertyLink');
			this.setUpAttrPropertyLink(...args);
		},
		initalized: true,
		/**
		 * Async fetch a HTML file, load into document.head,
		 * then register custom element
		 * @param  {String} templateLocation Location of HTML file containing template, empty string for none
		 * @param  {HTMLElement} newElement  New Custom HTMLElement
		 * @param  {String} HTMLname         Name to register HTMLElement as
		 */
		load: async function (templateLocation, newElement, HTMLname) {
			let jsName;
			if (HTMLname.indexOf('elements-') === 0) {
				jsName = this.removeNSTag(HTMLname);
			} else {
				jsName = HTMLname;
				HTMLname = 'elements-' + HTMLname;
			}
			if (this.loadedElements.has(jsName) || this.loadingElements.has(jsName)) {return;}
			if (templateLocation !== '') {
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
						this.loadedElements.add(jsName);
						this.loadingElements.delete(jsName);
						this.awaitCallback(jsName);
					}
				).catch((error) => {
					console.log("Failed network request for: " + error.message);
					this.loadingElements.delete(jsName);

				});
				this.loadingElements.add(jsName);
			} else {
				window.customElements.define(HTMLname, newElement);
				// Have to wait until the template is loaded for callback,
				// otherwise an upgrade can happen, calling the unintialized inherited element
				this.loadedElements.add(jsName);
				this.awaitCallback(jsName);
			}
		},
		/**
		 * Adds file to loadedElements, etc. as if it was registered, but without custom element logic
		 * Useful for requiring scripts/objects
		 * @param  {String} fileName name of file as passed to require
		 */
		loaded: async function (fileName) {
			this.loadedElements.add(fileName);
			this.awaitCallback(fileName);
		},
		/**
		 * Imports node 'templateElements' + name
		 * @param  {String} name name of element
		 * @return {Node}      imported Node
		 */
		importTemplate: (name) => {
			return document.importNode(document.querySelector('#templateElements' + name), true).content;
		},

		/**
		 * Loads a custom element from js files
		 * @param  {...String} elementNames name of element to import
		 */
		require: async function (...elementNames) {
			for (let name of elementNames) {
				if (name.indexOf('-') !== -1) {
					name = this.captilize(name);
				}
				if (!(this.requestedElements.has(name))) {
					let script = document.createElement('script');
					script.src = this.location + name + '.js';
					script.async = true;
					document.head.appendChild(script);
					this.requestedElements.add(name);
				}

			}
		},
		/**
		 * Removes dashes from HTMLElement name and converts to JS element name
		 * @param  {String} name HTMLElement name
		 * @return {String}      JS Element name
		 */
		captilize: function (name) {
			let l = name.split('-');
			for (let i = 1; i < l.length; i++) {
				l[i] = l[i].substring(0, 1).toUpperCase() + l[i].substring(1);
			}
			return l.join('');
		},
		/**
		 * Location to prefix file requests by, i.e. location of elements folder
		 * @type {String}
		 */
		location: '',
		/**
		 * Callback a function once required elements are loaded
		 * @param  {Function} callback    Function to call back
		 * @param  {...String}   moduleNames elements to wait to load first
		 */
		await: async function (callback, ...moduleNames) {
			let awaitObj = {
				callback: callback,
				awaiting: new Set(moduleNames),
			};
			for (let loaded of this.loadedElements) {
				awaitObj.awaiting.delete(loaded);
			}
			if (awaitObj.awaiting.size === 0) {
				callback();
				return;
			} else {
				this.awaiting.push(awaitObj);
			}

		},
		/**
		 * Array of awaitObjs, stores of waiting callbacks from await
		 * @type {Array}
		 */
		awaiting: [],
		/**
		 * Callback to process awaiting elements
		 * @param  {String} loaded Name of element loaded
		 */
		awaitCallback: async function (loaded) {
			// Remove 'elements-'
			loaded = this.removeNSTag(loaded);
			let position = 0;
			for (let awaitObj; position < this.awaiting.length;) {
				awaitObj = this.awaiting[position];
				awaitObj.awaiting.delete(loaded);
				if (awaitObj.awaiting.size === 0) {
					this.awaiting.splice(position, 1);
					awaitObj.callback();
				} else {
					position += 1;
				}
			}
		},
		/**
		 * Removes the 'elements-' NS from a HTMLElement name
		 * @param  {String} name name with 'elements-'
		 * @return {String}      name without 'elements-'
		 */
		removeNSTag: function (name) {
			if (name.indexOf('elements-') !== 0) {
				return name;
			} else {
				return name.substring(9);
			}
		},
		jsonIncludes: function (object, properties) {
			let result = {}
			for (let property of properties) {
				result[property] = object[property];
			}
			return result;
		},
		setToArray: function (set) {
			let result = [];
			for (let entry of set.values()) {
				result.push(entry);
			}
			return result;
		},
	}
}
