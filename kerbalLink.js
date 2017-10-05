'use strict';

/**
* KerbalLink - links UI and DBs together.
* Replace this to build a different UI
* @property {String} prefix Prefix to attach to read/writes to localStorage
* @property {Number} counter Counter to help uniquely name databasesw
*/
class KerbalLinkClass {
	constructor () {
		this.databases = new Map();
		this.prefix = 'elements-kerbal-database';
		this.UIs = new Map();
		this.counter = 0;
	}
	/**
	* Save a KDB
	* @param  {String} name Name of kdb to save
	* @throws {DOMException} Thrown if permission to localStorage has been denied
	*/
	save (name) {
		let db = this.databases.get(name);
		if (db === undefined) {
			return;
		}
		let json = JSON.stringify(db);
		window.localStorage.setItem(this.prefix + '-' + name, json);
	}
	/**
	* Load a KDB
	* @param  {String} name Name of kdb to load
	* @throws {DOMException} Thrown if permission to localStorage has been denied
	*/
	load (name) {
		let db;
		let getName = this.prefix + '-' + name;
		try {
			if (!(getName in window.localStorage)) {
				db = new KDB();
			} else {
				let json = window.localStorage.getItem(getName);
				db = KDB.fromJSON(json);
			}
		} catch (e) {
			console.log('Access to localStorage denied');
			throw e;
		}
		this.databases.set(name, db);
	}
	/**
	* Get a KDB
	* @param  {String} name Name of kdb to load
	* @return {KDB}         KDB
	*/
	get (name) {
		return this.databases.get(name);
	}
	/**
	* Set a KDB
	* @param {String} name Name of KDB
	* @param {KDB} db      KDB to set
	*/
	set (name, db) {
		this.databases.set(name, db);
	}
	/**
	* Register a UI compenent for other clients to find
	* @param  {String} name   Name of UI compenent
	* @param  {HTMLElement} object Object to register
	*/
	registerUI (name, object) {
		if (this.UIs.has(name)) {
			throw new Error('UI compenent already registered');
		} else {
			this.UIs.set(name, object);
		}
	}
	/**
	* Get a UI by name
	* @param  {String} name Name of UI compenent
	* @return {?HTMLElement} Object registered
	*/
	getUI (name) {
		if (this.UIs.has(name)) {
			return this.UIs.get(name);
		} else {
			return null;
		}
	}
}

{
let main = async () => {
	await Elements.get('KDB');

	/**
	 * Global KerbalLink
	 * @global
	 * @type {KerbalLinkClass}
	 */
	window.KerbalLink = new KerbalLinkClass();

	Elements.loaded('kerbalLink');
};
main();
}
