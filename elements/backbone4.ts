// Copied from elements_types to avoid making this a module
type PromiseCallback = (value: void | PromiseLike<void>) => void;

interface _ElementsBootLoader {
	get(...elementNames: string[]): Promise<void[]>;
	request (location: string): Promise<void>;
	importModule(elementName: string) : Promise<any>;
	initializedPromise: Promise<void> | null;

};

type Elements_Options = Partial<{
	'ELEMENTS_CORE_LOCATION': string;
}> | undefined;

let Elements: _ElementsBootLoader;

{
const _ELEMENTS_CORE_LOCATION = 'elements_core.js';
const _ELEMENTS_HELPER_LOCATION = 'elements_helper.js';
/**
 * Skeleton elements standin and bootloader.
 * Pretends to be the elements class
 */
class ElementsBootloader implements _ElementsBootLoader {
	/** Sets the requested resources to be loaded once the elements class has loaded.
	 * May preemptively load dependencies as shown in the manifest
	 * @param  {...String} elementNames names of things to load
	 */
	async get (...elementNames: string[]): Promise<void[]> {
		await this.initializedPromise;
		return Elements.get(...elementNames);
	}
	/**
	 * Waits for the elements class to be loaded, then makes an async network request, returning response body
	 * @param  {String} location location of file. Note: will not prefix .location for you
	 * @return {Promise}         Promise that resolves to the response body, can error
	 */
	async request (location: string): Promise<void> {
		await this.#helperPromise;
		return this.#request!(location);
	}
	async importModule(elementName: string): Promise<any> {
		await this.initializedPromise;
		return Elements.importModule(elementName);
	}
	#request: ((location: string) => Promise<any>) | null = null;
	#helperPromise: Promise<void>;
	#helperResolve!: PromiseCallback;
	/**
	 * A promise that resolves once the elements class has loaded
	 * For functions that need the real thing
	 * @type {?Promise}
	 */
	initializedPromise: Promise<void> | null = null;
	/**
	 * Resolve function for initializedPromise
	 * @type {Function}
	 * @private
	 */
        #resolve!: PromiseCallback;
        /**
         * Property to indicate to replace this shell
         * @type {Boolean}
         * @private
         */
        initialized: boolean = false;

	constructor () {
		this.initializedPromise = new Promise((resolve, _reject) => {
			this.#resolve = resolve;
		});
		this.#helperPromise = new Promise((resolve, _reject) => {
			this.#helperResolve = resolve;
		});
		let options: Elements_Options;
		try {
			//@ts-ignore
			options = ELEMENTS_OPTIONS;
		} catch (e) {
			if (e instanceof ReferenceError) {
				options = {};
			} else {
				throw e;
			}
		};
		const core_location = options!.ELEMENTS_CORE_LOCATION ?? './';
		import(core_location + _ELEMENTS_CORE_LOCATION).then((module) => {
			const base = module.Elements;
			Elements = base;
			this.#resolve();
		});
		import(core_location + _ELEMENTS_HELPER_LOCATION).then((module) => {
			this.#request = module.request;
			this.#helperResolve();
		});
	}
}

Elements = new ElementsBootloader();
}
