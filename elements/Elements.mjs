const LINK_INSERT_DIV_ID = 'Elements_Link_Insert_Location';
const PRELOAD_LOCATION = 'Elements_Preload_Location'
const SCRIPT_LOCATION = 'Elements_Script_Location'


let oldValue;
try {
	oldValue = elements;
	if (oldValue.initalized === false) {
		oldValue = null;
	}
} catch (e) {
	oldValue = null;
}

/**
 * Elements namespace
 * @namespace Elements
 */
let _Elements;

class Namespace {
	constructor (name) {
		this._name = name;
	}
}

/**
 * Elements namespace
 * @namespace Elements
 */
class Elements {
	/**
	* Store for actual custom elements
	* @namespace Elements.elements
	*/
	elements = {};
	/**
	* Store for objects to be inherited from, across modules
	* @type {Object}
	* @namespace Elements.inherits
	*/
	inherits = {};
	/**
	* Store for common/helper/misc objects to be used across modules
	* @type {Object}
	* @namespace Elements.common
	*/
	common = {};
	/**
	* Store for various object constructors
	* @memberof Elements
	* @type {Object}
	*/
	classes = {};
	/**
	 * Set of loaded element names
	 * @type {Set}
	 * @private
	 */
	#loadedElements = new Set();
	/**
	 * Storage set of loading elements
	 * @type {Set}
	 * @private
	 */
	#loadingElements = new Set();
	/**
	 * Storage set of elements requested but not yet loaded
	 * @type {Set}
	 * @private
	 */
	#requestedElements = new Set();
	/**
	 * Location to prefix file requests by, i.e. location of elements folder
	 * @type {String}
	 */
	location = 'elements/';
	/**
	 * Set of gotten elements (requested through get, not require)
	 * @type {Set}
	 * @private
	 */
	#gottenElements = new Set();
	/**
	 * Map to the promise for each request
	 * @type {Map}
	 * @private
	 */
	#getPromiseStore = new Map();
	/**
	 * The elements manifest. Contains information about modules and their dependencies
	 * @type {Object}
	 */
	manifest = {};
	/**
	 * flag for if the manifest has loaded
	 * @type {Boolean}
	 */
	manifestLoaded = false;
	/**
	 * Backlog of request awaiting the manifest to load
	 * @type {Array}
	 */
	getBacklog = [];
	/**
	 * Map to loading template requests
	 * @type {Map}
	 * @private
	 */
	#loadingTemplates = new Map();
	/**
	 * Set of locations of loaded templates
	 * @type {Set}
	 * @private
	 */
	#loadedTemplates = new Set();
	/**
	 * Set of locations of loaded css
	 * @type {Set}
	 * @private
	 */
	#loadedCSS = new Set();
	/**
	 * Set of locations of loaded resources
	 * @type {Set}
	 * @private
	 */
	#loadedResources = new Set();

	/**
	 * Place to insert templates, scripts, preloads, etc.
	 * @type {Node}
	 * @private
	 */
	#linkLocation;
	/**
	 * Place to insert preloads
	 * @type {Node}
	 * @private
	 */
	#preloadLocation;
	/**
	 * Place to insert scripts
	 * @type {Node}
	 * @private
	 */
	#scriptLocation;
	/**
	 * Place to insert templates
	 * @type {Node}
	 * @private
	 */
	#templateLocation;
	/**
	 * Property to prevent setup from been run twice
	 * @type {Boolean}
	 */
	initialized = true;

	initializedPromise = null;
	/**
	 * Constants for animation durations, offsets.
	 * @type {Object}
	 * @namespace Elements.animation
	 */
	animation = {
		/**
		 * Short animation duration (ms)
		 * @type {Number}
		 * @memberof Elements.animation
		 * @constant
		 */
		SHORT_DURATION: 100,
		/**
		 * Normal animation duration (ms)
		 * @type {Number}
		 * @memberof Elements.animation
		 * @constant
		 */
		MEDIUM_DURATION: 150,
		/**
		 * Long animation duration (ms)
		 * @type {Number}
		 * @memberof Elements.animation
		 * @constant
		 */
		LONG_DURATION: 300,
		/**
		 * Offset to drop/raise (pixels)
		 * @type {Number}
		 * @memberof Elements.animation
		 * @constant
		 */
		DROP_AMOUNT: 50,
	};
	/**
	 * Helper function to generate function to perform attribute overwrite
	 * @param  {HTMLElement} object   object to observe attribute on
	 * @param  {String} property property to observe
	 * @return {Function}          function to set value to attribute if it exists
	 */
	getInitProperty (object, property) {
		return (() => {
			// If the attribute is been written to, it should be handled by
			// the attribute changed callback
			if (object.getAttribute(property) === null) {
				object.setAttribute(property, object[property]);
			}
		});
	}

	/**
	 * Sets up a linked object property/attribute, as if the property and
	 * attribute were the same. Does things like copy attribute value to
	 * property value once inserted into DOM, checking if the property
	 * already has a value.
	 * @param  {HTMLElement} object      Element to set up link on
	 * @param  {String} property         property/attribute to link
	 * @param  {*} [inital=null]         value to intialize the type as
	 * @param  {Function} [eventTrigger] Function to call after property has been set
	 * @param  {Function} [santizer]     Function passed (new value, old value) before value is set. returns value to set property to.
	 * @return {{get: Function, set: Function}} The get and set function for the property
	 */
	setUpAttrPropertyLink (object, property, inital=null,
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
			set: setter,
		});

		object.getDict[property] = this.getInitProperty(object, property);
		object.setDict[property] = setter;

		setter(inital);

		return {
			get: getter,
			set: setter,
		};
	}

	setUpSanitizedAttrPropertyLink (...args) {
		console.warn('Using deprecated function setUpSanitizedAttrPropertyLink, it has now been merged with setUpAttrPropertyLink');
		this.setUpAttrPropertyLink(...args);
	}

	/**
	 * Async fetch a HTML file, load into document.head,
	 * then register custom element. Infers template location from HTMLname
	 * Additional templates will have to be loaded manually through loadTemplate
	 * @param  {HTMLElement} newElement  New Custom HTMLElement
	 * @param  {String} HTMLname         Name to register HTMLElement as
	 * @param  {Boolean} [includeTemplate=true] Whether to automatically include the template
	 * @param  {Promise} [templatePromise=Promise.resolve()] Additional promise to wait on before load, for addiational template loads
	 */
	async load (newElement, HTMLname, includeTemplate = true,
	            templatePromise = Promise.resolve()) {
		let jsName = HTMLname;
		if (HTMLname.indexOf('elements-') !== 0) {
			HTMLname = 'elements-' + HTMLname;
		}
		jsName = this._nameResolver(jsName);
		if (this.#loadedElements.has(jsName) || this.#loadingElements.has(jsName)) {return;}
		let preload;
		this.#loadingElements.add(jsName);
		if (includeTemplate) {
			let default_template = this.getDefaultTemplate(jsName, newElement);
			let load_promise = this.loadTemplate(default_template);
			preload = Promise.all([load_promise, templatePromise]);
		} else {
			preload = templatePromise;
		}
		try {
			await preload;
			window.customElements.define(HTMLname, newElement);
			this.#loadedElements.add(jsName);
			this.#loadingElements.delete(jsName);
			this.awaitCallback(jsName);
		} catch (e) {
			this.#loadingElements.delete(jsName);
			throw e;
		}
	}

	/**
	 * Adds file to loadedElements, etc. as if it was registered, but without custom element logic
	 * Useful for requiring scripts/objects
	 * @param  {String} fileName name of file as passed to require
	 */
	async loaded (fileName) {
		this.#loadedElements.add(fileName);
		this.awaitCallback(fileName);
	}

	/**
	 * Imports node 'templateElements' + name
	 * @param  {String} name name of element
	 * @return {Node}      imported Node
	 */
	importTemplate (name) {
		let id = '#templateElements' + name;
		let template = this.#templateLocation.querySelector(id);
		return document.importNode(template, true).content;
	}

	/**
	 * Loads a custom element from js files.
	 * @param  {...String} elementNames name of element to import
	 * @memberof! Elements
	 * @private
	 * @instance
	 */
	async _require (...elementNames) {
		for (let name of elementNames) {
			name = this._nameResolver(name);
			if (!(this.#requestedElements.has(name))) {
				let script = document.createElement('script');
				let suffix = '/element.js'
				let tokens = name.split('/');
				let last = tokens[tokens.length - 1].charAt(0);
				if (/[A-Z]/.test(last)) {
					suffix = '.js'
				} else {
					let tokens = name.split('/');
					if (tokens[tokens.length - 1] === 'common') {
						suffix = '.js'
					}
				}
				script.src = this.location + name + suffix;
				script.async = true;
				this.#scriptLocation.appendChild(script);
				this.#requestedElements.add(name);
			}
			this._setPromise(name);
		}
	}

	async _loadModule (elementName, requires) {
		if ((this.#requestedElements.has(elementName))) {
			return;
		}
		let name_tokens = this.tokenise(elementName);
		let module_name = name_tokens[name_tokens.length - 1];
		let location = elementName + '/' + module_name + '.mjs';
		let link = document.createElement('link');
		link.rel = 'modulepreload';
		link.href = this.location + location;
		this.#preloadLocation.append(link);
		this.#requestedElements.add(elementName);

		await this.get(...requires);

		let promise = import('./' + location);
		let module = await promise;
		let name = module.default.name;
		this.elements[name] = module.default;
	}

	/**
	 * Loads a custom element from js files. Shim to elements.get
	 * @param  {...String} elementNames name of element to import
	 * @deprecated
	 */
	async require (...elementNames) {
		console.warn('Using deprecated function require. Use Elements.get instead');
		this.get(elementNames);
	}

	/**
	 * Callback a function once required elements are loaded
	 * @param  {Function} callback    Function to call back
	 * @param  {...String}   moduleNames elements to wait to load first
	 * @deprecated
	 */
	async await (callback, ...moduleNames) {
		console.warn('Using deprecated function require. This function is been aduited for removal');
		await this.get(...moduleNames);
		callback();
	}

	/**
	 * Callback to process awaiting elements
	 * @param  {String} loaded Name of element loaded
	 */
	async awaitCallback (loaded) {
		loaded = this._nameResolver(loaded);
		// New style
		if (this.#getPromiseStore.has(loaded)) {
			this.#getPromiseStore.get(loaded).resolve();
		}
	}

	/**
	 * Removes the 'elements-' NS from a HTMLElement name
	 * @param  {String} name name with 'elements-'
	 * @return {String}      name without 'elements-'
	 */
	removeNSTag (name) {
		if (name.indexOf('elements-') !== 0) {
			return name;
		} else {
			return name.substring(9);
		}
	}

	/**
	 * Helper to reduce an object to only properties needed to stringify
	 * @param  {Object} object     object to reduce
	 * @param  {String[]} properties Properties to include
	 * @return {Object}            new object with properties copied over
	 */
	jsonIncludes (object, properties) {
		let result = {};
		for (let property of properties) {
			result[property] = object[property];
		}
		return result;
	}

	/**
	 * Converts a set to array, for stringification
	 * @param  {Set} set Set to convert to array
	 * @return {Array}   Array version of set
	 */
	setToArray (set) {
		let result = [];
		for (let entry of set.values()) {
			result.push(entry);
		}
		return result;
	}

	/**
	 * loads requested custom elements, modules etc.
	 * May preemptively load dependencies as shown in the manifest
	 * @param  {...String} elementNames names of things to load
	 * @return {Promise}                A promise that resolves when all requested things are loaded (await this)
	 */
	async get (...elementNames) {
		for (let name of elementNames) {
			if (!this.manifestLoaded) {
				this.getBacklog.push(name);
				// Don't slow load, it errors on v3, and the
				// manifest should be preloaded
			} else {
				this._get(name);
			}
		}
		return this._getPromise(...elementNames);
	}

	/**
	 * Implementation of get for a single request
	 * @param  {String} elementName name of module requested
	 * @return {Promise}            Promise resolving on load of module
	 */
	async _get (elementName) {
		let name = this._nameResolver(elementName);
		if (this.#gottenElements.has(name)) {
			return this._setPromise(name);
		} else if (name === 'main') {
		} else {
			this.#gottenElements.add(name);
		}
		let result = this._setPromise(name);
		if (name === 'main') {
			return result;
		}
		if (this.manifest === undefined || this.manifest === {}) {
			throw new Error('Elements v3 requires the manifest to be loaded before resolving packages');
		}
		let manifest = this.manifest[name];
		if (manifest === undefined) {
			// No entry in manifest
			throw new Error('Could not find "' + elementName + '" in the manifest');
		} else {
			// Recursivly look up dependencies
			if (manifest['type'] == 'element3' || manifest['type'] == 'module3') {
				this._loadModule(name, manifest['requires']);
			} else {
				this._require(name);
			}
			this.get(...manifest.requires);
			this.get(...manifest.recommends);
			// Pre-empt templates
			for (let template of manifest.templates) {
				if (template === 'default') {
					this.loadTemplate(name + '/template.html');
				} else {
					this.loadTemplate(template);
				}
			}
			for (let css of manifest.css) {
				this.loadCSS(css);
			}
			for (let resource of manifest.resources) {
				this.loadResource(resource);
			}
		}
		return result;
	}

	/**
	 * execute get requests that weren't possible before the manifest loaded
	 */
	async __getBacklog () {
		for (let name of this.getBacklog) {
			this.get(name);
		}
		this.getBacklog = [];
	}

	/**
	 * Helper function to get a promise.all on all requests
	 * @param  {...String} jsName names of requested files
	 * @return {Promise}          Promise resolving upon load of all requests
	 * @private
	 */
	_getPromise (...jsName) {
		let promises = [];
		for (let name of jsName) {
			name = this._nameResolver(name);
			promises.push(this._setPromise(name));
		}
		return Promise.all(promises);
	}

	/**
	 * Generates a new promise for request, returns existing one if it exists
	 * @param  {String} jsName Name of file been requested
	 * @return {Promise}       Promise resolving on load of request
	 * @private
	 */
	_setPromise (jsName) {
		if (this.#getPromiseStore.has(jsName)) {
			return this.#getPromiseStore.get(jsName).promise;
		}
		let outerResolve, outerReject;
		let result = new Promise((resolve, reject) => {
			outerResolve = resolve;
			outerReject = reject;
		});
		this.#getPromiseStore.set(jsName,
		{
			promise: result,
			resolve: outerResolve,
			reject: outerReject,
		});
		return result;
	}

	/**
	 * Transforms a request into the .js file that provides it
	 * @param  {String} name name of request e.g. elements-drag-element, drag-element, dragElement
	 * @return {String}      name of .js for name e.g. dragDown
	 * @private
	 */
	_nameResolver (name) {
		name = this.removeNSTag(name);
		if (name.includes('/')) {
			return name;
		}
		if (name.includes('.')) {
			// Find a provider
			name = this.findProvider(name);
			if (name === null) {
				throw new Error('Can not find a provider for ' + name);
			}
			return name;
		}
		if (/[A-Z]/.test(name.charAt(0))) {
			// Module name, treat differently
			return name.split('-').join('/');
		} else {
			let tokens = this.tokenise(name);
			return tokens.join('/');
		}
	}

	/**
	 * Load the elements manifest from network
	 */
	async loadManifest () {
		console.log('Requested manifest', performance.now())
		if (this.manifestLoaded) {return;}
		// let request, response;
		// let header = new Headers({
		// 	'Content-Type': 'application/json',
		// });
		// request = await fetch(this.location + 'elementsManifest.json', {
		// 	headers: header,
		// });
		// if (request.ok) {
		// 	response = await request.text();
		// } else {
		// 	console.log('Failed network request for: ' + request.url);
		// 	return;
		// }
		// console.log('Got manifest', performance.now())
		// this.manifest = JSON.parse(response);
		// this.manifestLoaded = true;
		// this.__getBacklog();
	}

	/**
	 * Make an async network request, returning response body
	 * @param  {String} location location of file. Note: will not prefix .location for you
	 * @return {Promise}         Promise that resolves to the response body, can error
	 */
	async request (location) {
		return fetch(location).then(
			(response) => {
				if (response.ok) {
					return response.text();
				} else {
					throw new Error(response.url);
				}
			}
		);
	}

	/**
	 * Find a module that provides the request
	 * @param  {String} name Name of submodule
	 * @return {String}      Name of module that contains the submodule
	 */
	findProvider (name) {
		for (let item in this.manifest) {
			if (this.manifest[item].provides.includes(name)) {
				return item;
			}
		}
		return null;
	}

	/**
	 * Loads template from location
	 * @param  {String} location Location of element. Note: does prefix location, does not add .html
	 * @return {Promise}         Promise that resolves once template is received
	 */
	async loadTemplate (location) {
		// debugger;
		let template;
		if (this.#loadedTemplates.has(location) || location === '') {return;}
		if (this.#loadingTemplates.has(location)) {
			await this.#loadingTemplates.get(location);
			return;
		}

		let fetcher = async (resolve, reject) => {
			try {
				template = await this.request(this.location + location);
			} catch (e) {
				console.log('Failed network request for: ' + e.message);
				this.#loadingTemplates.delete(location);
				throw e;
			}
			// Rewrite css links with Elements.location
			let div = document.createElement('div');
			div.innerHTML = template;
			let node = div.querySelector('template');
			for (let link of node.content.querySelectorAll('link')) {
				link.href = this.location + link.getAttribute('href');
			}
			for (let link of node.content.querySelectorAll('img')) {
				link.src = this.location + link.getAttribute('src');
			}
			this.#templateLocation.append(node);
			this.#loadedTemplates.add(location);
			this.#loadingTemplates.delete(location);
			resolve(location);
		};

		let promise = new Promise(fetcher);

		this.#loadingTemplates.set(location, promise);
		return promise;
	}

	/**
	 * Function to santize boolean attributes
	 * @param  {Boolean|String} value A boolean or a string representing a boolean
	 * @return {Boolean}              Input converted to boolean
	 */
	booleaner (value) {
		if (typeof(value) == 'boolean') {
			return value;
		}
		return !(value === 'false');
	}

	/**
	 * Returns a equivalent requestAnimationFrame, but subsequent calls
	 * before frame trigger cancel previous ones
	 * @return {Function} Pretends to be requestAnimationFrame
	 */
	rafContext () {
		let raf = null;
		return (f) => {
			if (raf !== null) {
				cancelAnimationFrame(raf);
			}
			raf = requestAnimationFrame((e) => {
				f(e);
				raf = null;
			});
		};
	}

	/**
	 * Desanitizes a string for HTML.
	 * Used for UI output where escaping is not required, i.e. not HTML.
	 * e.g. placeholder value set via js
	 * @param  {String} string Sanitized string
	 * @return {String}        Unsafe string
	 */
	nameDesanitizer (string) {
		string = string.replace(/&amp/g, '&');
		string = string.replace(/&lt/g, '<');
		string = string.replace(/&gt/g, '>');
		return string;
	}

	/**
	 * Sanitizes a string for HTML.
	 * @param  {String} string Unsafe string
	 * @return {String}        Sanitized string
	 */
	nameSanitizer (string) {
		string = string.trim();
		string = string.replace(/&/g, '&amp');
		string = string.replace(/</g, '&lt');
		string = string.replace(/>/g, '&gt');
		return string;
	}

	/**
	 * Sets up a linked object property/attribute, for backbone2. Does things like copy attribute value to
	 * property value once inserted into DOM, checking if the property
	 * already has a value.
	 * @param  {HTMLElement} object      Element to set up link on
	 * @param  {String} property         property/attribute to link
	 * @param  {*} [initial=null]         value to intialize the type as
	 * @param  {Function} [eventTrigger] Function to call after property has been set
	 * @param  {Function} [santizer]     Function passed (new value, old value) before value is set. returns value to set property to.
	 */
	setUpAttrPropertyLink2 (object, property, initial=null,
		   eventTrigger = () => {},
		   santizer = (value, oldValue) => {return value;}) {
		const fail_message = 'Attr-Property must be in constructor.observedAttributes';
		console.assert(object.constructor.observedAttributes.includes(property), fail_message);
		let hidden;
		let getter = () => {return hidden;};
		let setter = (value) => {
			value = santizer(value, hidden);
			if (value === hidden) {return;}
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
			set: setter,
		});
		object.applyPriorProperty(property, initial);
	}

	/**
	 * Preloads css from location
	 * @param  {String} location Location of css file. Note: does not append .css
	 * @return {Promise}         Promise that resolves once template is received
	 */
	async loadCSS (location) {
		if (this.#loadedCSS.has(location)) {return;}
		let link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'style';
		link.href = this.location + location;
		this.#preloadLocation.appendChild(link);
		this.#loadedCSS.add(location);
	}
	/**
	 * Preloads image from location
	 * @param  {String} location Location of image file. Note: does not append .png
	 * @return {Promise}         Promise that resolves once template is received
	 */
	async loadResource (location) {
		if (this.#loadedResources.has(location)) {return;}
		let link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = this.location + location;
		this.#preloadLocation.appendChild(link);
		this.#loadedResources.add(location);
	}

	/**
	 * Split an element name in seperated tokens
	 * @param  {String} name Name to tokenise
	 * @return {String[]}    Array of tokens
	 */
	tokenise (name) {
		if (name.includes('-')) {
			return name.split('-');
		} else if (name.includes('/')) {
			return name.split('/');
		} else {
			let tokens = [];
			let firstCharacter = /[A-Z]/;
			let position;
			while ((position = name.search(firstCharacter)) !== -1) {
				let token = name.substring(0, position);
				name = name.charAt(position).toLowerCase() + name.substring(position + 1, name.length);
				tokens.push(token);
			}
			tokens.push(name);
			return tokens;
		}
	}

	captialize (string) {
		return string.charAt(0).toUpperCase() + string.substring(1, string.length);
	}

	constructor () {
		const head = document.head;
		let insert_location = head.querySelector('#' + LINK_INSERT_DIV_ID);
		if (insert_location === null) {
			insert_location = document.createElement('div');
			insert_location.id = LINK_INSERT_DIV_ID;
			head.append(insert_location);
		}
		this.#linkLocation = insert_location;
		this.#preloadLocation = insert_location.querySelector('#' + PRELOAD_LOCATION);
		if (this.#preloadLocation === null) {
			this.#preloadLocation = document.createElement('div');
			this.#preloadLocation.id = PRELOAD_LOCATION;
			insert_location.append(this.#preloadLocation);
		}
		this.#scriptLocation = insert_location.querySelector('#' + SCRIPT_LOCATION);
		if (this.#scriptLocation === null) {
			this.#scriptLocation = document.createElement('div');
			this.#scriptLocation.id = SCRIPT_LOCATION;
			insert_location.append(this.#scriptLocation);
		}
		this.#templateLocation = document.createElement('div');
	}

	getDefaultTemplate (jsName, element) {
		let version = element.__backbone_version;
		if (version === undefined) {
			console.log('Couldn\'t find version of ', element);
			version = 2;
		}
		switch (version) {
			case 1:
			case 2:
				return jsName + '/template.html';
				break;
			case 3:
				let tokens = this.tokenise(jsName);
				let last = tokens[tokens.length - 1];
				return jsName + '/' + last + 'Template.html';
				break;
			default:
			return jsName + '/template.html';
			break;
		}
	}
}

import {backbone, backbone2, backbone3} from './elements_backbone.mjs'
if (oldValue === null) {

	/**
	* Main loader
	* @type {Elements}
	*/
	_Elements = new Elements();
	_Elements.elements.backbone = backbone;
	_Elements.elements.backbone2 = backbone2;
	_Elements.elements.backbone3 = backbone3;
} else {
	_Elements = oldValue;
}

export {_Elements as Elements};
export {_Elements as default}
