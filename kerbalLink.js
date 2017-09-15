'use strict';

		constructor () {
			this.databases = new Map();
			this.prefix = 'elements-kerbal-database';
		}
		save (name) {
			let db = this.databases.get(name);
			if (db === undefined) {
				return;
			}
			let json = JSON.stringify(db);
			window.localStorage.setItem(this.prefix + '-' + name, json);
class KerbalLinkClass {
	constructor () {
		}
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
		get (name) {
			return this.databases.get(name);
		}
		set (name, db) {
			this.databases.set(name, db);
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
