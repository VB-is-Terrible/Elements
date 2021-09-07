const LINK_INSERT_DIV_ID = 'Elements_Link_Insert_Location';
const PRELOAD_LOCATION = 'Elements_Preload_Location'
const SCRIPT_LOCATION = 'Elements_Script_Location'


import {backbone, backbone2, backbone3, Backbone} from './elements_backbone.js';
import {getInitProperty, removeNSTag, request, tokenise} from './elements_helper.js';
import {setUpAttrPropertyLink, booleaner, nameSanitizer, nameDesanitizer, rafContext, jsonIncludes, setToArray, upgradeManifest} from './elements_helper.js';
import type {manifest_t, PromiseCallback, manifest_t_optional} from './elements_types'


/**
 * Elements namespace
 * @namespace Elements
 */
class Elements {
	/**
	* Store for actual custom elements
	* @namespace Elements.elements
	*/
	elements: {[key: string]: unknown} = {};
	/**
	* Store for objects to be inherited from, across modules
	* @type {Object}
	* @namespace Elements.inherits
	*/
	inherits: {[key: string]: unknown} = {};
	/**
	* Store for common/helper/misc objects to be used across modules
	* @type {Object}
	* @namespace Elements.common
	*/
	common: {[key: string]: unknown} = {};
	/**
	* Store for various object constructors
	* @memberof Elements
	* @type {Object}
	*/
	classes: {[key: string]: unknown} = {};
	/**
	 * Set of loaded element names
	 * @type {Set}
	 * @private
	 */
	#loadedElements: Set<string> = new Set();
	/**
	 * Storage set of loading elements
	 * @type {Set}
	 * @private
	 */
	#loadingElements: Set<string> = new Set();
	/**
	 * Storage set of elements requested but not yet loaded
	 * @type {Set}
	 * @private
	 */
	#requestedElements: Set<string> = new Set();
	/**
	 * Location to prefix file requests by, i.e. location of elements folder
	 * Now autodected based on the core location
	 * @type {String}
	 */
	location: string;
	/**
	 * Set of gotten elements (requested through get, not require)
	 * @type {Set}
	 * @private
	 */
	#gottenElements: Set<string> = new Set();
	/**
	 * Map to the promise for each request
	 * @type {Map}
	 * @private
	 */
	#getPromiseStore: Map<string, {
		promise: Promise<void>,
		resolve: PromiseCallback,
		reject: PromiseCallback}> = new Map();
	/**
	 * The elements manifest. Contains information about modules and their dependencies
	 * While optional in v1 and v2, in order to combine v2 and v3/4 elements, this is now mandatory
	 * @type {Object}
	 */
	#manifest: manifest_t = {};
	/**
	 * flag for if the manifest has loaded
	 * @type {Boolean}
	 */
	#manifestLoaded: boolean = false;
	/**
	 * Backlog of request awaiting the manifest to load
	 * @type {Array}
	 */
	#getBacklog: Array<string> = [];
	/**
	 * Map to loading template requests
	 * @type {Map}
	 * @private
	 */
	#loadingTemplates: Map<string, Promise<string>> = new Map();
	/**
	 * Set of locations of loaded templates
	 * @type {Set}
	 * @private
	 */
	#loadedTemplates: Set<string> = new Set();
	/**
	 * Set of locations of loaded css
	 * @type {Set}
	 * @private
	 */
	#loadedCSS: Set<string> = new Set();
	/**
	 * Set of locations of loaded resources
	 * @type {Set}
	 * @private
	 */
	#loadedResources: Set<string> = new Set();

	/**
	 * Place to insert templates, scripts, preloads, etc.
	 * @type {Node}
	 * @private
	 */
	#linkLocation: Element;
	/**
	 * Place to insert preloads
	 * @type {Node}
	 * @private
	 */
	#preloadLocation: Element;
	/**
	 * Place to insert scripts
	 * @type {Node}
	 * @private
	 */
	#scriptLocation: Element;
	/**
	 * Place to insert templates
	 * @type {Node}
	 * @private
	 */
	#templateLocation: Element;
	/**
	 * Property to prevent setup from been run twice
	 * @type {Boolean}
	 */
	initialized: boolean = true;

	initializedPromise: Promise<null> | null = null;
	/**
	 * Constants for animation durations, offsets.
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
	 * @deprecated
	 */
	setUpAttrPropertyLink<O, K extends keyof O> (
		object: backbone & O,
		property: K & string,
		inital: unknown = null,
		eventTrigger: (value: unknown) => void = (_value: unknown) => {},
		santizer: (value: unknown, old_value: unknown) => void = (value: unknown, _oldValue: unknown) => {return value;})
		: { get: () => unknown; set: (value: unknown) => void; } {

		//@ts-ignore
		console.assert((object.constructor.observedAttributes as unknown as Array<string>).includes(property));

		let hidden: unknown;

		if (object[property] !== undefined) {
			inital = object[property];
		}
		let getter = () => {return hidden;};
		let setter = (value: unknown) => {
			value = santizer(value, hidden);
			hidden = value;
			if (object.attributeInit) {
				// Force convert to string
				//@ts-ignore
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

		object.getDict[property] = getInitProperty(object, property);
		object.setDict[property] = setter;

		setter(inital);

		return {
			get: getter,
			set: setter,
		};
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
	async load (
		newElement: CustomElementConstructor & Backbone,
		HTMLname: string,
		includeTemplate: boolean = true,
	        templatePromise: Promise<void> = Promise.resolve()) {
		let jsName = HTMLname;
		if (HTMLname.indexOf('elements-') !== 0) {
			HTMLname = 'elements-' + HTMLname;
		}
		jsName = this.#nameResolver(jsName);
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
			this.#awaitCallback(jsName);
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
	async loaded (fileName: string) {
		this.#loadedElements.add(fileName);
		this.#awaitCallback(fileName);
	}

	/**
	 * Imports node 'templateElements' + name
	 * @param  {String} name name of element
	 * @return {Node}      imported Node
	 */
	importTemplate (name: string): DocumentFragment {
		let id = '#templateElements' + name;
		let template = this.#templateLocation.querySelector(id) as HTMLTemplateElement | null;
		if (template === null) {
			throw new Error(`No loaded template for ${name}`);
		}
		return document.importNode(template, true).content;
	}

	/**
	 * Loads a custom element from js files.
	 * @param  {...String} elementNames name of element to import
	 * @memberof! Elements
	 * @private
	 * @instance
	 */
	async #require (...elementNames: string[]) {
		for (let name of elementNames) {
			name = this.#nameResolver(name);
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
			this.#setPromise(name);
		}
	}

	async #loadModule (elementName: string, extension = '.mjs') {
		if ((this.#requestedElements.has(elementName))) {
			return;
		}
		let name_tokens = tokenise(elementName);
		let module_name = name_tokens[name_tokens.length - 1];
		let location = elementName + '/' + module_name + extension;
		this.#requestedElements.add(elementName);

		let module = await import('./' + location);
		let last = module_name.charAt(0);
		if (!/[A-Z]/.test(last)) {
			if ('observedAttributes' in module.default) {
				let name = module.default.name;
				this.elements[name] = module.default;
			}
		}
		if ('elements_loaded' in module) {
			const load_array = await module.elements_loaded;
			for (const load of load_array) {
				this.loaded(load);
			}
		}

	}
	async #loadScript(elementName: string, requires: string[]) {
		if ((this.#requestedElements.has(elementName))) {
			return;
		}
		const name_tokens = tokenise(elementName);
		let module_name = name_tokens[name_tokens.length - 1];
		let location = this.location + elementName + '/' + module_name + '.js';
		let link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'script';
		link.href = location;
		this.#preloadLocation.append(link);
		this.#requestedElements.add(elementName);
		let script = document.createElement('script');
		script.src = location;
		script.async = true;

		await this.get(...requires);

		this.#scriptLocation.appendChild(script);
	}

	/**
	 * Callback to process awaiting elements
	 * @param  {String} loaded Name of element loaded
	 */
	async #awaitCallback (loaded: string) {
		loaded = this.#nameResolver(loaded);
		// New style
		const promise = this.#getPromiseStore.get(loaded);
		if (promise !== undefined) {
			promise.resolve();
		} else {
			this.#getPromiseStore.set(loaded, {
				promise: Promise.resolve(),
				resolve: () => {},
				reject: () => {},
			});
		}
	}


	/**
	 * Helper to reduce an object to only properties needed to stringify
	 * @param  {Object} object     object to reduce
	 * @param  {String[]} properties Properties to include
	 * @return {Object}            new object with properties copied over
	 * @deprecated
	 */
	jsonIncludes<O, K extends keyof O> (object: O, properties: (K & string)[]): object {
		console.warn('Using deprecated function \'jsonIncludes\'');
		return jsonIncludes(object, properties);
	}

	/**
	 * Converts a set to array, for stringification
	 * @param  {Set} set Set to convert to array
	 * @return {Array}   Array version of set
	 * @deprecated
	 */
	setToArray (set: Set<unknown>): Array<unknown> {
		console.warn('Using deprecated function \'setToArray\'');
		return setToArray(set);
	}

	/**
	 * loads requested custom elements, modules etc.
	 * May preemptively load dependencies as shown in the manifest
	 * @param  {...String} elementNames names of things to load
	 * @return {Promise}                A promise that resolves when all requested things are loaded (await this)
	 */
	async get (...elementNames: string[]): Promise<void[]> {
		for (let name of elementNames) {
			if (!this.#manifestLoaded) {
				this.#getBacklog.push(name);
				// Don't slow load, it errors on v3, and the
				// manifest should be preloaded
			} else {
				this.#get(name);
			}
		}
		return this.#getPromise(...elementNames);
	}

	/**
	 * Implementation of get for a single request
	 * @param  {String} elementName name of module requested
	 * @return {Promise}            Promise resolving on load of module
	 * @private
	 */
	async #get (elementName: string): Promise<void> {
		let name = this.#nameResolver(elementName);
		if (this.#gottenElements.has(name)) {
			return this.#setPromise(name);
		} else if (name === 'main') {
		} else {
			this.#gottenElements.add(name);
		}
		let result = this.#setPromise(name);
		if (name === 'main') {
			return result;
		}
		if (this.#manifest === undefined || this.#manifest === {}) {
			throw new Error('Elements v3+ requires the manifest to be loaded before resolving packages');
		}
		let manifest = this.#manifest[name];
		if (manifest === undefined) {
			// No entry in manifest
			throw new Error('Could not find "' + elementName + '" in the manifest');
		} else {
			switch (manifest['type']) {
				case 'element3':
				case 'module3':
					this.#loadModule(name);
					break;
				case 'element4':
				case 'module4':
					this.#loadModule(name, '.js');
					break;
				case 'script4':
					this.#loadScript(name, manifest['requires']);
					break;
				default:
					this.#require(name);
					break;
			}
			// Recursivly look up dependencies
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
	async #doGetBacklog () {
		for (let name of this.#getBacklog) {
			this.get(name);
		}
		this.#getBacklog = [];
	}

	/**
	 * Helper function to get a promise.all on all requests
	 * @param  {...String} jsName names of requested files
	 * @return {Promise}          Promise resolving upon load of all requests
	 * @private
	 */
	#getPromise (...jsName: string[]): Promise<void[]> {
		let promises = [];
		for (let name of jsName) {
			name = this.#nameResolver(name);
			promises.push(this.#setPromise(name));
		}
		return Promise.all(promises);
	}

	/**
	 * Generates a new promise for request, returns existing one if it exists
	 * @param  {String} jsName Name of file been requested
	 * @return {Promise}       Promise resolving on load of request
	 * @private
	 */
	#setPromise (jsName: string): Promise<void> {
		const promise = this.#getPromiseStore.get(jsName);
		if (promise !== undefined) {
			return promise.promise;
		}
		let outerResolve: PromiseCallback, outerReject: PromiseCallback;
		let result = new Promise<void>((resolve, reject) => {
			outerResolve = resolve;
			outerReject = reject;
		});
		this.#getPromiseStore.set(jsName,
		{
			promise: result,
			resolve: outerResolve!,
			reject: outerReject!,
		});
		return result;
	}

	/**
	 * Transforms a request into the .js file that provides it
	 * @param  {String} name name of request e.g. elements-drag-element, drag-element, dragElement
	 * @return {String}      name of .js for name e.g. dragDown
	 * @private
	 */
	#nameResolver (name: string): string {
		name = removeNSTag(name);
		if (name.includes('/')) {
			return name;
		}
		if (name.includes('.')) {
			// Find a provider
			const computed_name = this.findProvider(name);
			if (computed_name === null) {
				throw new Error('Can not find a provider for ' + name);
			}
			return computed_name;
		}
		if (/[A-Z]/.test(name.charAt(0))) {
			// Module name, treat differently
			return name.split('-').join('/');
		} else {
			let tokens = tokenise(name);
			return tokens.join('/');
		}
	}

	/**
	 * Load the elements manifest from network
	 */
	async #loadManifest () {
		console.log('Requested manifest', performance.now())
		if (this.#manifestLoaded) {return;}
		let request, response: manifest_t_optional;
		request = await fetch(this.location + 'elements_manifest.json', {
			credentials: 'include',
		});
		if (request.ok) {
			response = await request.json();
		} else {
			console.log('Failed network request for: ' + request.url);
			return;
		}
		console.log('Got manifest', performance.now())
		for (const item in response) {
			this.#manifest[item] = upgradeManifest(response[item]);
		}

		this.#manifestLoaded = true;
		this.#doGetBacklog();
	}

	/**
	 * Find a module that provides the request
	 * @param  {String} name Name of submodule
	 * @return {String}      Name of module that contains the submodule
	 */
	findProvider (name: string): string | null {
		for (let item in this.#manifest) {
			if (this.#manifest[item].provides.includes(name)) {
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
	async loadTemplate (location: string): Promise<any> {
		let template;
		if (this.#loadedTemplates.has(location) || location === '') {return;}
		if (this.#loadingTemplates.has(location)) {
			await this.#loadingTemplates.get(location);
			return;
		}

		let fetcher = async (resolve: (_value: string) => void, reject: PromiseCallback) => {
			try {
				template = await request(this.location + location);
			} catch (e) {
				console.log('Failed network request for: ' + (e as Error).message);
				this.#loadingTemplates.delete(location);
				reject();
				throw e;
			}
			// Rewrite css links with Elements.location
			let div = document.createElement('div');
			div.innerHTML = template;
			for (const node of div.querySelectorAll('template')) {
				if (node === null) {
					throw new Error('Template file ' + location + 'does not have template');
				}
				for (let link of node.content.querySelectorAll('link')) {
					link.href = this.location + link.getAttribute('href');
				}
				for (let link of node.content.querySelectorAll('img')) {
					link.src = this.location + link.getAttribute('src');
				}
				this.#templateLocation.append(node);
			}
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
	 * @param  {*} value A boolean or a string representing a boolean
	 * @return {Boolean}              Input converted to boolean
	 * @deprecated
	 */
	booleaner (value: unknown): boolean {
		console.warn('Using deprecated function \'booleaner\'');
		return booleaner(value);
	}

	/**
	 * Returns a equivalent requestAnimationFrame, but subsequent calls
	 * before frame trigger cancel previous ones
	 * @return {Function} Pretends to be requestAnimationFrame
	 * @deprecated
	 */
	rafContext (): (f: (timestamp: number) => void) => void {
		console.warn('Using deprecated function \'rafContext\'');
		return rafContext();
	}

	/**
	 * Desanitizes a string for HTML.
	 * Used for UI output where escaping is not required, i.e. not HTML.
	 * e.g. placeholder value set via js
	 * @param  {String} string Sanitized string
	 * @return {String}        Unsafe string
	 * @deprecated
	 */
	nameDesanitizer (string: string): string {
		console.warn('Using deprecated function \'nameDesanitizer\'');
		return nameDesanitizer(string);
	}

	/**
	 * Sanitizes a string for HTML.
	 * @param  {String} string Unsafe string
	 * @return {String}        Sanitized string
	 * @deprecated
	 */
	nameSanitizer (string: string): string {
		console.warn('Using deprecated function \'nameSanitizer\'');
		return nameSanitizer(string);
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
	 * @deprecated
	 */
	setUpAttrPropertyLink2<O, K extends keyof O, T extends {toString: () => string} & O[K]> (
		object: backbone2 & O,
		property: K & string,
		initial: T | null = null,
		eventTrigger: (value: unknown) => void = (_value: unknown) => {},
		santizer: (value: unknown, old_value: T) => T = (value: any, _oldValue: any) => {return value;}) {

		console.warn('Using deprecated function \'setUpAttrProperty\'');
		setUpAttrPropertyLink(object, property, initial, eventTrigger, santizer);
	}

	/**
	 * Preloads css from location
	 * @param  {String} location Location of css file. Note: does not append .css
	 * @return {Promise}         Promise that resolves once template is received
	 */
	async loadCSS (location: string): Promise<any> {
		if (this.#loadedCSS.has(location)) {return;}
		let link = document.createElement('link');
		link.rel = 'prefetch';
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
	async loadResource (location: string): Promise<any> {
		if (this.#loadedResources.has(location)) {return;}
		let link = document.createElement('link');
		link.rel = 'prefetch';
		link.as = 'image';
		link.href = this.location + location;
		this.#preloadLocation.appendChild(link);
		this.#loadedResources.add(location);
	}
	constructor () {
		const url = new URL(import.meta.url);
		const path = url.pathname;
		const folders = path.split('/');
		folders.pop();
		const new_path = folders.join('/');
		url.pathname = new_path;
		this.location = url.href + '/';

		const head = document.head;
		let insert_location = head.querySelector('#' + LINK_INSERT_DIV_ID);
		if (insert_location === null) {
			insert_location = document.createElement('div');
			insert_location.id = LINK_INSERT_DIV_ID;
			head.append(insert_location);
		}
		this.#linkLocation = insert_location;
		const insertion_point = insert_location.querySelector('#' + PRELOAD_LOCATION);
		if (insertion_point === null) {
			this.#preloadLocation = document.createElement('div');
			this.#preloadLocation.id = PRELOAD_LOCATION;
			insert_location.append(this.#preloadLocation);
		} else {
			this.#preloadLocation = insertion_point;
		}
		const script_point = insert_location.querySelector('#' + SCRIPT_LOCATION);
		if (script_point === null) {
			this.#scriptLocation = document.createElement('div');
			this.#scriptLocation.id = SCRIPT_LOCATION;
			insert_location.append(this.#scriptLocation);
		} else {
			this.#scriptLocation = script_point;
		}
		this.#templateLocation = document.createElement('div');
		this.#loadManifest();
	}

	/**
	 * Retrive the location of the default template
	 * @param  {String} jsName  The unifed name of the element
	 * @param  {HTMLElement} element The element to find the default template for
	 * @return {String}         The location of the default template
	 */
	getDefaultTemplate(jsName: string, element: Backbone): string {
		let version: number = element.__backbone_version;
		if (version === undefined) {
			console.log('Couldn\'t find version of element', element);
			version = 2;
		}
		switch (version) {
			case 1:
			case 2:
				return jsName + '/template.html';
			case 3:
			case 4:
				let tokens = tokenise(jsName);
				let last = tokens[tokens.length - 1];
				return jsName + '/' + last + 'Template.html';
			default:
				return jsName + '/template.html';
		}
	}
	/**
	 * Import a module named according to elements
	 * @param {string} elementName Element name of the module to improt
	 * @return             The imported module
	 */
	async importModule(elementName: string) {
		const name = this.#nameResolver(elementName);
		let name_tokens = tokenise(name);
		let module_name = name_tokens[name_tokens.length - 1];
		let location = name + '/' + module_name + '.js';
		await this.get(elementName);
		return import('./' + location);
	}
}

let _Elements = new Elements();
_Elements.elements.backbone = backbone;
_Elements.elements.backbone2 = backbone2;
_Elements.elements.backbone3 = backbone3;

export {_Elements as Elements};
export {_Elements as default}
