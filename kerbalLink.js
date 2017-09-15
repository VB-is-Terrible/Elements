'use strict';

/**
* KerbalLink - links UI and DBs together.
* Replace this to build a different UI
* @property {String} prefix Prefix to attach to read/writes to localStorage
*/
class KerbalLinkClass {
	constructor () {
		this.databases = new Map();
		this.prefix = 'elements-kerbal-database';
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
		}
		}
	}
}

{
let main = async () => {
	await Elements.get('KDB');

	window.KerbalLink = new KerbalLinkClass();

	Elements.loaded('kerbalLink');
};
main();
}
