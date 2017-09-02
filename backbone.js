// Elements Bootloader
'use strict'


if (!('Elements' in window) || Elements.initalized === false) {
	/**
	 * Elements namespace
	 * @namespace Elements
	 */
	window.Elements = {
		/**
		 * Store for actual custom elements
		 * @memberof Elements
		 * @namespace Elements.elements
		 */
		elements: {
			/**
			 * Base class for elements
			 * @memberof Elements.elements
			 * @property {Function} constructor
			 */
			backbone: class extends HTMLElement {
				/**
				 * Make a new element
				 * @memberof! Elements.elements.backbone
				 * @alias Elements.elements.backbone.constructor
				 */
				constructor () {
					super();

					this.getDict = {};
					this.setDict = {};

					this.attributeInit = false;
					return this;
				}
				/**
				 * Called once inserted into DOM
				 * @memberof! Elements.elements.backbone

				 */
				connectedCallback () {
					if (this.attributeInit === false){
						for (let func in this.getDict) {
							this.getDict[func]();
						}
					}
					this.attributeInit = true;
				}
				/**
				 * Called when a attribute changes
				 * @param  {String} attrName name of attribute changed
				 * @param  {String} oldValue Value before change
				 * @param  {String} newValue Value after change
				 * @memberof! Elements.elements.backbone
				 */
				attributeChangedCallback(attrName, oldValue, newValue) {
					if (attrName in this.setDict && oldValue !== newValue) {
						this.setDict[attrName](newValue);
					}
				}
				// disconnectedCallback () {
				//
				// }
			},
		},
		/**
		 * Set of loaded element names
		 * @type {Set}
		 * @memberof! Elements
		 */
		loadedElements: new Set(),
		/**
		 * Storage set of loading elements
		 * @type {Set}
		 * @memberof! Elements
		 */
		loadingElements: new Set(),
		/**
		 * Storage set of elements requested but not yet loaded
		 * @type {Set}
		 * @memberof! Elements
		 */
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
		/**
		 * Helper function to generate function to perform attribute overwrite
		 * @param  {HTMLElement} object   object to observe attribute on
		 * @param  {String} property property to observe
		 * @return {Function}          function to set value to attribute if it exists
		 * @memberof! Elements
		 */
		getInitProperty: function (object, property) {
			return (() => {
				// If the attribute is been written to, it should be handled by
				// the attribute changed callback
				if (object.getAttribute(property) === null) {
					object.setAttribute(property, object[property]);
				}
			});
		},
		/**
		 * Sets up a linked object property/attribute, as if the property and attribute
		 * were the same. Does things like copy attribute value to property value
		 * once inserted into DOM, checking if the property already has a value.
		 * @param  {HTMLElement} object      Element to set up link on
		 * @param  {String} property         property/attribute to link
		 * @param  {*} [inital=null]         value to intialize the type as
		 * @param  {Function} [eventTrigger] function to call after property has been set
		 * @param  {Function} [santizer]     function passed (new value, old value) before value is set. returns value to set property to.
		 * @return {{get: Function, set: Function}} The get and set function for the property
		 * @memberof! Elements
		 */
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
		 * @memberof! Elements
		 */
		load: async function (templateLocation, newElement, HTMLname) {
			let jsName = HTMLname;
			if (HTMLname.indexOf('elements-') !== 0) {
				HTMLname = 'elements-' + HTMLname;
			}
			jsName = this.__nameResolver(jsName);
			if (this.loadedElements.has(jsName) || this.loadingElements.has(jsName)) {return;}
			if (templateLocation !== '') {
				try {
					this.loadingElements.add(jsName);
					await this.loadTemplate(templateLocation);
					window.customElements.define(HTMLname, newElement);
					this.loadedElements.add(jsName);
					this.loadingElements.delete(jsName);
					this.awaitCallback(jsName);
				} catch (e) {
					this.loadingElements.delete(jsName);
				}
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
		 * @memberof! Elements
		 */
		loaded: async function (fileName) {
			this.loadedElements.add(fileName);
			this.awaitCallback(fileName);
		},
		/**
		 * Imports node 'templateElements' + name
		 * @param  {String} name name of element
		 * @return {Node}      imported Node
		 * @memberof! Elements
		 */
		importTemplate: (name) => {
			return document.importNode(document.querySelector('#templateElements' + name), true).content;
		},

		/**
		 * Loads a custom element from js files
		 * @param  {...String} elementNames name of element to import
		 * @memberof! Elements
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
				this.__setPromise(name);
			}
		},
		/**
		 * Removes dashes from HTMLElement name and converts to JS element name
		 * @param  {String} name HTMLElement name
		 * @return {String}      JS Element name
		 * @memberof! Elements
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
		 * @memberof! Elements
		 */
		location: '',
		/**
		 * Callback a function once required elements are loaded
		 * @param  {Function} callback    Function to call back
		 * @param  {...String}   moduleNames elements to wait to load first
		 * @memberof! Elements
		 */
		await: async function (callback, ...moduleNames) {
			await this.get(...moduleNames);
			callback();

		},
		/**
		 * Callback to process awaiting elements
		 * @param  {String} loaded Name of element loaded
		 * @memberof! Elements
		 */
		awaitCallback: async function (loaded) {
			loaded = this.__nameResolver(loaded);
			// New style
			if (this.__getPromiseStore.has(loaded)) {
				this.__getPromiseStore.get(loaded).resolve();
			}
		},
		/**
		 * Removes the 'elements-' NS from a HTMLElement name
		 * @param  {String} name name with 'elements-'
		 * @return {String}      name without 'elements-'
		 * @memberof! Elements
		 */
		removeNSTag: function (name) {
			if (name.indexOf('elements-') !== 0) {
				return name;
			} else {
				return name.substring(9);
			}
		},
		/**
		 * Helper to reduce an object to only properties needed to stringify
		 * @param  {Object} object     object to reduce
		 * @param  {String[]} properties Properties to include
		 * @return {Object}            new object with properties copied over
		 * @memberof! Elements
		 */
		jsonIncludes: function (object, properties) {
			let result = {}
			for (let property of properties) {
				result[property] = object[property];
			}
			return result;
		},
		/**
		 * Converts a set to array, for stringification
		 * @param  {Set} set Set to convert to array
		 * @return {Array}   Array version of set
		 * @memberof! Elements
		 */
		setToArray: function (set) {
			let result = [];
			for (let entry of set.values()) {
				result.push(entry);
			}
			return result;
		},
		/**
		 * Set of gotten elements (requested through get, not require)
		 * @type {Set}
		 * @memberof! Elements
		 */
		__gottenElements: new Set(),
		/**
		 * loads requested custom elements, modules etc.
		 * May preemptively loaded dependacies as shown in the manifest
		 * @param  {...String} elementNames names of things to load
		 * @return {Promise}                A promise that resolves when all requested things are loaded (await this)
		 * @memberof! Elements
		 */
		get: async function (...elementNames) {
			for (let name of elementNames) {
				if (!this.manifestLoaded) {
					this.getBacklog.push(name);
					this.require(name); // Slow load as well
				} else {
					this.__get(name);
				}
			}
			return this.__getPromise(...elementNames);
		},
		/**
		 * Implementation of get for a single request
		 * @param  {String} elementName name of module requested
		 * @return {Promise}            Promise resolving on load of module
		 * @memberof! Elements
		 */
		__get: async function (elementName) {
			let name = this.__nameResolver(elementName);
			if (this.__gottenElements.has(name)) {
				return this.__setPromise(name);
			} else {
				this.__gottenElements.add(name);
			}
			let result = this.__setPromise(name);
			let manifest = this.manifest[name];
			if (manifest === undefined) {
				// No manifest, just require it
				this.require(name);
			} else {
				// Recursivly look up dependacies
				this.require(name);
				this.get(...manifest.requires);
				// Pre-empt templates
				for (let template of manifest.templates) {
					this.loadTemplate(template);
				}
			}
			return result;
		},
		/**
		 * execute get requests that weren't possible before the manifest loaded
		 * @memberof! Elements
		 */
		__getBacklog: async function () {
			for (let name of this.getBacklog) {
				this.__get(name);
			}
			this.getBacklog = [];
		},
		/**
		 * Map to the promise for each request
		 * @type {Map}
		 * @memberof! Elements
		 */
		__getPromiseStore: new Map(),
		/**
		 * Helper function to get a promise.all on all requests
		 * @param  {...String} jsName names of requested files
		 * @return {Promise}          Promise resolving upon load of all requests
		 * @memberof! Elements
		 */
		__getPromise: function (...jsName) {
			let promises = [];
			for (let name of jsName) {
				name = this.__nameResolver(name);
				promises.push(this.__setPromise(name));
			}
			return Promise.all(promises);
		},
		/**
		 * Generates a new promise for request, returns existing one if it exists
		 * @param  {String} jsName Name of file been requested
		 * @return {Promise}       Promise resolving on load of request
		 * @memberof! Elements
		 */
		__setPromise: function (jsName) {
			if (this.__getPromiseStore.has(jsName)) {
				return this.__getPromiseStore.get(jsName).promise;
			}
			let outerResolve, outerReject;
			let result = new Promise((resolve, reject) => {
				outerResolve = resolve;
				outerReject = reject;
			});
			this.__getPromiseStore.set(jsName,
			{
				promise: result,
				resolve: outerResolve,
				reject: outerReject,
			});
			return result;
		},
		/**
		 * Transforms a request into the .js file that provides it
		 * @param  {String} name name of request e.g. elements-drag-down, drag-down, dragDown
		 * @return {String}      name of .js for name e.g. dragDown
		 * @memberof! Elements
		 */
		__nameResolver: function (name) {
			name = this.removeNSTag(name);
			if (name.includes('-')) {
				name = this.captilize(name);
			} else if (name.includes('.')) {
				// Find a provider
				name = this.findProvider(name);
				if (name === null) {
					throw new Error('Can not find a provider for ' + name);
				}
			}
			return name;
		},
		/**
		 * Load the elements manifest from network
		 * @memberof! Elements
		 */
		loadManifest: async function () {
			if (this.manifestLoaded) {return;}
			let request;
			try {
				request = await this.request(this.location + 'elementsManifest.json');
			} catch (e) {
				console.log('Failed network request for: ' + error.message);
				return;
			}
			this.manifest = JSON.parse(request);
			this.manifestLoaded = true;
			this.__getBacklog();
		},
		/**
		 * The elements manifest. Contains information about modules and their dependacies
		 * @type {Object}
		 * @memberof! Elements
		 */
		manifest: {},
		/**
		 * flag for if the manifest has loaded
		 * @type {Boolean}
		 * @memberof! Elements
		 */
		manifestLoaded: false,
		/**
		 * Backlog of request awaiting the manifest to load
		 * @type {Array}
		 * @memberof! Elements
		 */
		getBacklog: [],
		/**
		 * Make an async network request, returning response body
		 * @param  {String} location location of file. Note: will not prefix .location for you
		 * @return {Promise}         Promise that resolves to the respone body, can error
		 * @memberof! Elements
		 */
		request: async function (location) {
			return fetch(location).then(
				(response) => {
					if (response.ok) {
						return response.text();
					} else {
						throw new Error(response.url);
					}
				}
			);
		},
		/**
		 * Find a module that provides the request
		 * @param  {String} name Name of submodule
		 * @return {String}      Name of module that contains the submodule
		 * @memberof! Elements
		 */
		findProvider: function (name) {
			for (let item in this.manifest) {
				if 	(this.manifest[item].provides.includes(name)) {
					return item;
				}
			}
			return null;
		},
		/**
		 * Map to loading template requests
		 * @type {Map}
		 * @memberof! Elements
		 */
		loadingTemplates: new Map(),
		/**
		 * Set of locations of loaded templates
		 * @type {Set}
		 * @memberof! Elements
		 */
		loadedTemplates: new Set(),
		/**
		 * Loads template from location
		 * @param  {String} location Location of template. Note: does not prefix location or append .html
		 * @return {Promise}         Promise that resolves once template is received
		 * @memberof! Elements
		 */
		loadTemplate: async function (location) {
			let template;
			if (this.loadedTemplates.has(location) || template === '') {return;}
			if (this.loadingTemplates.has(location)) {
				await this.loadingTemplates.get(location);
				return;
			}

			let fetcher = async (resolve, reject) => {
				try {
					template = await this.request(location);
				} catch (e) {
					console.log('Failed network request for: ' + e.message);
					this.loadingTemplates.delete(location);
					throw e;
				}
				document.head.innerHTML += template;
				this.loadedTemplates.add(location);
				this.loadingTemplates.delete(location);
				resolve(location);
			};

			let promise = new Promise(fetcher);

			this.loadingTemplates.set(location, promise);
			return promise;
		},
		/**
		 * Function to santize boolean attributes
		 * @param  {Boolean|String} value A boolean or a string representing a boolean
		 * @return {Boolean}              Input converted to boolean
		 * @memberof! Elements
		 */
		booleaner: (value) => {
			if (typeof(value) == 'boolean') {
				return value;
			}
			return !(value === 'false')
		},
	}
	Elements.loadManifest();
}
