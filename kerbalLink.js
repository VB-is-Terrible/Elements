'use strict';

let KerbalLinkClass;
{
const counterString = 'elements-kerbal-counter';
const lastDB = 'elements-kerbal-last-database';
/**
* KerbalLink - links UI and DBs together.
* Replace this to build a different UI
* @property {String} prefix Prefix to attach to read/writes to localStorage
* @property {Number} counter Counter to help uniquely name databasesw
*/
KerbalLinkClass =  class KerbalLinkClass {
	constructor () {
		/**
		 * Storage of various dbs
		 * @type {Map<String, KDB>}
		 * @private
		 */
		this.databases = new Map();
		this.prefix = 'elements-kerbal-database';
		/**
		 * Mapping by database to a mapping of associated UI compenents
		 * @type {Map<String, Map<String, HTMLElement>>}
		 * @private
		 */
		this.UIs = new Map();
		let count = localStorage[counterString] || 0;
		this.__counter = parseInt(count);
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
	* @param  {Function} reviver Function to take in saved DB, returns revived db
	* @param  {String} [alias=name] Name to rename kdb to
	* @throws {DOMException} Thrown if permission to localStorage has been denied
	*/
	load (name, reviver, alias = name) {
		let db;
		let getName = this.prefix + '-' + name;
		try {
			if (!(getName in window.localStorage)) {
				db = new KDB();
			} else {
				let json = window.localStorage.getItem(getName);
				db = reviver(json);
			}
		} catch (e) {
			console.log('Access to localStorage denied');
			throw e;
		}
		this.set(alias, db);
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
		this.UIs.set(name, new Map());
	}
	/**
	 * Delete a db
	 * @param  {String} name Name of db to delete
	 */
	delete (name) {
		this.databases.delete(name);
	}
	/**
	* Register a UI compenent for other clients to find
	* @param  {String} database Name of the database to attach compenent to
	* @param  {String} name   Name of UI compenent
	* @param  {HTMLElement} object Object to register
	*/
	registerUI (database, name, object) {
		if (!this.UIs.has(database)) {
			throw new Error('Database has not been registered yet');
		}
		let dbMap = this.UIs.get(database);
		if (dbMap.has(name)) {
			throw new Error('UI compenent already registered');
		} else {
			dbMap.set(name, object);
		}
	}
	/**
	* Get a UI by name
	* @param  {String} database Name of the database the compenent is attached to
	* @param  {String} name Name of UI compenent
	* @return {?HTMLElement} Object registered
	*/
	getUI (database, name) {
		let dbMap = this.UIs.get(database);
		if (dbMap === undefined) {
			return null;
		}
		if (dbMap.has(name)) {
			return dbMap.get(name);
		} else {
			return null;
		}
	}
	/**
	 * Get a iterator for the names of all compenents registered with a database
	 * @param  {String} database Name of database to look up
	 * @return {String[]}        Iterator of compenent names
	 */
	getUIAll (database) {
		let dbMap = this.UIs.get(database);
		if (dbMap === undefined) {
			return [];
		} else {
			return dbMap.keys();
		}

	}
	/**
	 * Deregister a UI compenent
	 * @param  {String} database Name of database to remove UI compenent from
	 * @param  {String} name     Name of compenent to remove
	 */
	removeUI (database, name) {
		let dbMap = this.UIs.get(database);
		if (dbMap === undefined) {
			return;
		}
		dbMap.delete(name);
	}
	get counter () {
		let result = this.__counter;
		this.__counter += 1;
		localStorage[counterString] = this.__counter.toString();
		return result;
	}
	/**
	 * Set the db named to be used on page load
	 * @param {String} name Name of db to set a default
	 */
	setNextLoad (name) {
		if (!this.databases.has(name)) {return;}
		localStorage[lastDB] = name;
	}
	/**
	 * Load the db set in setNextLoad
	 * @param  {Function} reviver Reviver function to pass to load
	 */
	loadDefault (reviver) {
		let last = localStorage[lastDB] || 'default';
		this.load(last, reviver, 'default');
		localStorage[lastDB] = 'default';
	}
}
}

let KerbalLink;

{
let main = async () => {
	/**
	 * Global KerbalLink
	 * @global
	 * @type {KerbalLinkClass}
	 */
	KerbalLink = new KerbalLinkClass();

	Elements.loaded('kerbalLink');
};
main();
}
