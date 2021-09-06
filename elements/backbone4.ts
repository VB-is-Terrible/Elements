// Copied from elements_types to avoid making this a module
type PromiseCallback = (value: void | PromiseLike<void>) => void;

interface _ElementsBootLoader {
	get(...elementNames: string[]): Promise<void[]>;
	request (location: string): Promise<void>;
	importModule(elementName: string) : Promise<any>;
	initializedPromise: Promise<void> | null;

};

let Elements: _ElementsBootLoader;

{
const _ELEMENTS_CORE_LOCATION = './elements_core.js';
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
		await this.initializedPromise;
		return Elements.request(location);
	}
	async importModule(elementName: string): Promise<any> {
		await this.initializedPromise;
		return Elements.importModule(elementName);
	}
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
        private _resolve!: PromiseCallback;
        /**
         * Property to indicate to replace this shell
         * @type {Boolean}
         * @private
         */
        initialized: boolean = false;

	constructor () {
		this.initializedPromise = new Promise((resolve, _reject) => {
			this._resolve = resolve;
		});
		let core_location: string;
		try {
			//@ts-ignore
			core_location = ELEMENTS_CORE_LOCATION;
		} catch (e) {
			core_location = _ELEMENTS_CORE_LOCATION;
			if (!(e instanceof ReferenceError)) {
				throw e;
			}
		}
		import(core_location).then((module) => {
			const base = module.Elements;
			Elements = base;
			this._resolve();
		})
	}
}

Elements = new ElementsBootloader();
}
