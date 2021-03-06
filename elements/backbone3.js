let Elements;
let importValue;
{
const ELEMENTS_BASE_CLASS_LOCATION = './elements_core.js';
/**
 * Skeleton elements standin and bootloader.
 * Pretends to be the elements class
 */
class ElementsBootloader {
	/**
	 * The elements manifest. Contains information about modules and their dependencies
	 * While optional in v1 and v2, in order to combine v2 and v3 elements, this is now mandatory
	 * @type {Object}
	 */
	manifest = {};
	/**
	 * Location to prefix file requests by, i.e. location of elements folder
	 * Can be set before load by setting ELEMENTS_PRELOAD_LOCATION
	 * @type {String}
	 */
	location = 'elements/';
	/**
	 * flag for if the manifest has loaded
	 * @type {Boolean}
	 */
	manifestLoaded = false;
	/**
	 * Empty __getBacklog, can't do anything without the elements class loaded,
	 * And the main class will be called based on manifestLoaded
	 */
	__getBacklog () {
		this.manifestLoaded = true;
	}
	/** Sets the requested resources to be loaded once the elements class has loaded.
	 * May preemptively load dependencies as shown in the manifest
	 * @param  {...String} elementNames names of things to load
	 */
	async get (...elementNames) {
		await this.initializedPromise;
		return Elements.get(...elementNames);
	}
	/**
	 * Waits for the elements class to be loaded, then makes an async network request, returning response body
	 * @param  {String} location location of file. Note: will not prefix .location for you
	 * @return {Promise}         Promise that resolves to the response body, can error
	 */
	async request (location) {
		await this.initializedPromise;
		return Elements.request(location);
	}
	/**
	 * Empty function. This has empty for a while
	 */
	loadManifest () {}
	/**
	 * Backlog of request awaiting the manifest and main class to load
	 * @type {Array<String>}
	 */
	getBacklog = [];
	/**
	 * A promise that resolves once the elements class has loaded
	 * For functions that need the real thing
	 * @type {?Promise}
	 */
	initializedPromise = null;
	/**
	 * Resolve function for initializedPromise
	 * @type {Function}
	 * @private
	 */
	_resolve;
        /**
         * Property to indicate to replace this shell
         * @type {Boolean}
         */
        initialized = false;

	constructor () {
		const self = this;
		this.initializedPromise = new Promise((resolve, reject) => {
			self._resolve = resolve;
		});
		try {
			this.location = ELEMENTS_PRELOAD_LOCATION;
		} catch (e) {
			if (!(e instanceof ReferenceError)) {
				throw e;
			}
		}
		import(ELEMENTS_BASE_CLASS_LOCATION).then((module) => {
			const base = module.Elements;
			Elements = base;
			base.manifest = this.manifest;
			base.location = this.location;
			base.manifestLoaded = this.manifestLoaded;
			base.getBacklog = this.getBacklog;
			if (this.manifestLoaded) {
				base.__getBacklog();
			}
			this._resolve();
                        importValue = module;
		})
	}
}

Elements = new ElementsBootloader();
}
