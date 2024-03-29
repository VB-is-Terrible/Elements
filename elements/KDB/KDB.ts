import {Elements} from '../elements_core.js';
import {GConstructor, jsonIncludes, setToArray} from '../elements_helper.js';

/**
 * Interface for display of a Kerbal
 * @interface KerbalDisplay
 */
/**
 * @property {KNS.Kerbal} data
 * @description The kerbal to display
 * @name KerbalDisplay.data
 */
/**
 * @function updateData
 * @description Fired when kerbal.data or kerbal.text changes
 * @name KerbalDisplay.updateData
 */
/**
 *
 * @function showJob
 * @description Fired whenever a depth changes
 * @name KerbalDisplay.showJob
 * @param {String} place place where the mission depth has changed
 *
 */
/**
 * @function delete
 * @description Fired when the kerbal is deleted
 * @name KerbalDisplay.delete
*/
/**
 * Interface for a display of a KDB.
 * If you want updates for kerbals, you'll need to subscribe to the kerbal indivually
 * @interface KDBDisplay
 */
/**
 * @function addKerbal
 * @param {KNS.Kerbal} kerbal The added kerbal
 * @description Fired after a kerbal is added
 * @name KDBDisplay.addKerbal
 */
/**
 * @function deleteKerbal
 * @param {KNS.Kerbal} kerbal The deleted kerbal
 * @description Fired after a kerbal is deleted
 * @name KDBDisplay.deleteKerbal
 */
/**
 * @function renameKerbal
 * @param {String} oldName Old name of the renamed kerbal
 * @param {String} newName New name of the renamed kerbal
 * @description Fired after a kerbal is renamed
 * @name KDBDisplay.renameKerbal
 */
/**
 * @function addGroup
 * @param {KNS.Group} group The added group
 * @description Fired after a group is added
 * @name KDBDisplay.addGroup
 */
/**
 * @function removeGroup
 * @param {KNS.Group} group The removed group
 * @description Fired after a group is removed
 * @name KDBDisplay.removeGroup
*/
/**
 * @property {String} database Name of the kdb to display
 * @description The KDB to display
 * @name KDBDisplay.database
*/
/**
 * Interface for a Group of Kerbals
 * If you want updates for kerbals, you'll need to subscribe to the kerbal indivually
 * @interface GroupDisplay
 */
/**
 * @function addKerbal
 * @param {KNS.Kerbal} kerbal Kerbal that was added
 * @description Fired after a kerbal is added
 * @name GroupDisplay.addKerbal
 */
/**
 * @function deleteKerbal
 * @param {KNS.Kerbal} kerbal Name of the deleted kerbal
 * @description Fired after a kerbal is deleted
 * @name GroupDisplay.deleteKerbal
 */
/**
 * @function updateData
 * @description Fired when Group.data or Group.text changes
 * @name GroupDisplay.updateData
 */
/**
 * @property {KNS.Group} data
 * @description The Group to display
 * @name GroupDisplay.data
 */


export interface Kerbal {
	jobs: JobList;
	displays: KerbalDisplay[];
	type: 'Kerbal';
	duplicate (): Kerbal;
};

export interface KerbalDisplay {
	data: Kerbal | null;
	updateData: () => void;
	showJob: (arg0: KSP_PLACES_T) => void;
	delete: () => void;
};

interface KerbalObj {
	name: string;
	text: string;
	type: string;
	jobs: CompactJobList;
};

export interface Group {
	kerbals: Set<Kerbal>;
	type: 'Group';
};

export interface GroupDisplay {
	data: Group;
	updateData: () => void;
	addKerbal: (arg0: Kerbal) => void;
	deleteKerbal: (arg0: Kerbal) => void;
};

interface GroupObj {
	name: string;
	text: string;
	type: string;
	kerbals: Array<string>;

};

export interface KDB {
	groups: Map<number, Group>;
	kerbalObjs: Map<string, Kerbal>;
	type: 'KDB';

};

export interface KDBDisplay {
	addKerbal: (kerbalObj: Kerbal) => void;
	deleteKerbal: (kerbal: Kerbal) => void;
	renameKerbal: (oldName: string, newName: string) => void;
	addGroup: (group: Group) => void;
	removeGroup: (group: Group) => void;
	database: string | null;
};

interface KDBObj {
	type: 'KDB';
	kerbalObjs: Array<Kerbal>;
	groups: Array<Group>;
};

interface KDBJSONObj {
	type: 'KDB';
	kerbalObjs: Array<KerbalObj>;
	groups: Array<GroupObj>;
};

type KSP_PLACES_T = 'Kerbin'| 'Mun'| 'Minmus'| 'Eve'| 'Gilly'| 'Duna'| 'Ike'| 'Dres'| 'Jool'| 'Laythe'| 'Vall'| 'Tylo'| 'Bop'| 'Pol'| 'Eeloo'| 'Kerbol';

type KSP_PLACE_DEPTH = 0 | 1 | 2 | 3 | 4;

const KSP_PLACES: Array<KSP_PLACES_T> = ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo', 'Kerbol'] as Array<KSP_PLACES_T>;
const MAX_JOB_VALUE: KSP_PLACE_DEPTH = 4;






/**
 * @typedef {Object.<String, Number>} JobList
 */

type JobList = Record<KSP_PLACES_T, KSP_PLACE_DEPTH>;
type CompactJobList = Partial<Record<KSP_PLACES_T, Exclude<KSP_PLACE_DEPTH, 0>>>;



/**
 * Remove any places that have a value of 0
 * @param  {JobList} jobList A jobList
 * @return {CompactJobList}         A reduced jobList
 */
const reducePlaceList = (jobList: JobList): CompactJobList => {
	let placeList: CompactJobList = {};
	for (let place of KSP_PLACES) {
		const place_value = jobList[place];
		if (place_value != 0) {
			placeList[place] = place_value;
		}
	}
	return placeList;
};

/**
 * Kerbal backend type
 * @type {Object}
 * @property {String} name Name of kerbal
 * @property {String} text Description text of kerbal
 * @property {JobList} jobs PlaceName -> job value mapping
 * @property {KerbalDisplay[]} displays Array of UI elements representing this kerbal.
 * @memberof KNS
 */
export class Kerbal implements Kerbal {
	private _name: string = 'Kerbal';
	private _text: string = 'Desc';
	jobs: JobList;
	displays: KerbalDisplay[] = [];
	type: 'Kerbal' = 'Kerbal';
	constructor () {
		this.jobs = KNS.blankPlaceList(0);
	}
	get name () {
		return this._name;
	}
	set name (value) {
		this._name = value;
		this.dispatchUIUpdate();
	}
	get text () {
		return this._text;
	}
	set text (value) {
		this._text = value;
		this.dispatchUIUpdate();
	}
	/**
	 * Update UIs for one place
	 * @param  {String} place Place name
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	dispatchUpdate (place: KSP_PLACES_T) {
		for (let display of this.displays) {
			display.showJob(place);
		}

	}
	/**
	 * Updates name and place of UIs
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	dispatchUIUpdate () {
		for (let display of this.displays) {
			display.updateData();
		}
	}
	/**
	 * Add a job to kerbal
	 * @param {String} place Location to visit
	 * @param {Number} value Depth of visit
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	addJob (place: KSP_PLACES_T, value: KSP_PLACE_DEPTH) {
		if (this.jobs[place] >= value) {
			return;
		}
		this.jobs[place] = value;
		this.dispatchUpdate(place);
	}
	/**
	 * Remove a job, as if the kerbal has just completed one
	 * @param  {String} location Location visited
	 * @param  {Number} value    Depth of visited
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	removeJob (location: KSP_PLACES_T, value: KSP_PLACE_DEPTH) {
		if (this.jobs[location] > value) {
			return;
		}
		this.jobs[location] = 0;
		this.dispatchUpdate(location);
	}
	/**
	 * Register a display to kerbal
	 * @param {KerbalDisplay} display Display to register
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	addDisplay (display: KerbalDisplay) {
		if (this.displays.includes(display)) {
			return;
		}
		this.displays.push(display);
	}
	/**
	 * Deregister a display to kerbal
	 * @param  {KerbalDisplay} display [description]
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	removeDisplay (display: KerbalDisplay) {
		let index = this.displays.indexOf(display);
		if (index < 0) {return;}
		this.displays.splice(index, 1);
	}
	/**
	 * Number of destinations to visit
	 * @return {Number} Number of locations to visit
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	get size (): number {
		let size = 0;
		for (let location of KNS.places) {
			if (this.jobs[location] !== 0) {
				size += 1;
			}
		}
		return size;
	}
	toJSON () {
		let result: KerbalObj = jsonIncludes(this, ['name', 'text', 'type']) as KerbalObj;
		result.jobs = reducePlaceList(this.jobs);
		return result;
	}
	/**
	 * Delete this kerbal
	 * @memberof KNS.Kerbal
	 * @instance
	 */
	delete () {
		for (let display of this.displays) {
			display.delete();
		}
	}
	/**
	 * Construct an kerbal from the object returned from JSON.parse(JSON.stringify(kerbal))
	 * @param  {Object} jsonObj JSON.parse'd kerbal
	 * @return {KNS.Kerbal}     Reconstitued Kerbal
	 * @memberof KNS.Kerbal
	 */
	static fromJSONObj (jsonObj: KerbalObj): Kerbal {
		if (jsonObj.type !== 'Kerbal') {
			throw new KDBParseError('Not a kerbal');
		}
		let kerbal = new this();
		let jobs = jsonObj.jobs;
		//@ts-ignore
		delete jsonObj.jobs;
		//@ts-ignore
		Object.assign(kerbal, jsonObj);
		for (let location in jobs) {
			kerbal.jobs[location as KSP_PLACES_T] = jobs[location as KSP_PLACES_T]!;
		}

		return kerbal;
	}
	/**
	 * Equality check for KDBs
	 * @param  {KNS.Kerbal} kerbal1 First kerbal to compare
	 * @param  {KNS.Kerbal} kerbal2 Second kerbal to compare
	 * @return {Boolean}   If the two kerbals are equalivalent
	 * @memberof KNS.Kerbal
	 */
	static equals (kerbal1: Kerbal, kerbal2: Kerbal): boolean {
		if (kerbal1.name !== kerbal2.name) {
			return false;
		}
		if (kerbal1.text !== kerbal2.text) {
			return false;
		}
		for (let place of KNS.places) {
			if (kerbal1.jobs[place] !== kerbal2.jobs[place]) {
				return false;
			}
		}
		return true;
	}
	/**
	 * Duplicate the kerbal
	 * @return {KNS.Kerbal} Duplicated kerbal
	 * @memberof KNS.Kerbal
	 */
	duplicate (): Kerbal {
		return Kerbal.fromJSONObj(JSON.parse(JSON.stringify(this)));
	}
};

/**
 * Returns a object with the mapping [place] -> value for all places
 * @param  {*} value Default value
 * @return {JobList}  Mapping of [place] -> value
 * @memberof KNS
 */
export const blankPlaceList = function<O> (value: O): Record<KSP_PLACES_T, O> {
	let placeList = {} as Record<KSP_PLACES_T, O>;
	for (let place of KSP_PLACES) {
		placeList[place] = value;
	}
	return placeList;
}

/**
 * A Group of kerbals
 * @param  {Number} id Unique id to identify group by
 * @property {String} name Name of Group
 * @property {String} text Description text of group
 * @property {Number} id Unique id to identify group by
 * @property {Set<KNS.Kerbals>} kerbals Set of the kerbals in group. Note - don't modify directly
 * @type {Object}
 */
export class Group implements Group {
	kerbals: Set<Kerbal>;
	private __id: number;
	private __displays: Set<GroupDisplay>;
	private __name: string = 'Group';
	private __text: string = 'Desc';
	type: 'Group' = 'Group';
	constructor (id: number) {
		this.kerbals = new Set();
		this.__id = id;
		/**
		 * Set of registered displays
		 * @type {Set<GroupDisplay>}
		 * @private
		 */
		this.__displays = new Set();
	}
	get name () {
		return this.__name;
	}
	set name (value) {
		this.__name = value;
		this.updateData();
	}
	get text () {
		return this.__text;
	}
	set text (value) {
		this.__text = value;
		this.updateData();
	}
	get id () {
		return this.__id;
	}
	set id (value) {
		this.__id = value;
	}
	get size () {
		return this.kerbals.size;
	}
	/**
	 * Add a kerbal to this group
	 * @param {KNS.Kerbal} kerbal Kerbal to add
	 * @memberof KNS.Group
	 */
	addKerbal (kerbal: Kerbal) {
		if (this.kerbals.has(kerbal)) {
			return;
		}
		if (!(kerbal instanceof Kerbal)) {
			console.warn('Adding a non-kerbal to a group');
		}
		this.kerbals.add(kerbal);
		for (let display of this.__displays) {
			display.addKerbal(kerbal);
		}
	}
	/**
	 * Remove a kerbal from this group.
	 * Note - currently assuming that the KDB will inform us of a kerbal
	 * deletion, and that we don't have to listen for it
	 * @param  {KNS.Kerbal} kerbal Kerbal to remove
	 * @memberof KNS.Group
	 */
	deleteKerbal (kerbal: Kerbal) {
		if (!this.kerbals.has(kerbal)) {return;}
		this.kerbals.delete(kerbal);
		for (let display of this.__displays) {
			display.deleteKerbal(kerbal);
		}
	}
	/**
	 * Renames a kerbal. Does not error if kerbal does not existNote - mainly for use by KDB
	 * @param  {String} _oldName Current name of kerbal
	 * @param  {String} _newName New name for kerbal
	 * @memberof KNS.Group
	 */
	renameKerbal (_oldName: string, _newName: string) {}
	/**
	 * Find kerbal by name
	 * @param  {String} name Kerbal name
	 * @return {?KNS.Kerbal} Kerbal if found, null if not
	 * @memberof KNS.Group
	 */
	getKerbal (name: string): Kerbal | null {
		let result = null;
		for (let kerbal of this.kerbals) {
			if (kerbal.name === name) {
				result = kerbal;
			}
		}
		return result;
	}
	/**
	 * Call remove place on all member kerbals
	 * @param  {String} location Location visited
	 * @param  {Number} value    Depth of visited
	 * @memberof KNS.Group
	 */
	removePlace (location: KSP_PLACES_T ,value: KSP_PLACE_DEPTH) {
		for (let kerbal of this.kerbals.values()) {
			kerbal.removeJob(location, value);
		}
	}
	/**
	 * Register a display to recieve callbacks on state changes
	 * @param {GroupDisplay} display Display to register
	 * @memberof KNS.Group
	 */
	addDisplay (display: GroupDisplay) {
		this.__displays.add(display);
	}
	/**
	 * Deregister a display
	 * @param  {GroupDisplay} display Display to deregister
	 * @memberof KNS.Group
	 */
	removeDisplay (display: GroupDisplay) {
		this.__displays.delete(display);
	}
	/**
	 * Trigger the updateData callback of registered listeners
	 * @private
	 * @memberof KNS.Group
	 */
	updateData () {
		for (let display of this.__displays) {
			display.updateData();
		}
	}
	/**
	 * Check if a kerbal is in a group
	 * @param  {KNS.Kerbal}  kerbal Kerbal to check
	 * @return {Boolean}     If kerbal is in this group
	 * @memberof KNS.Group
	 */
	hasKerbal (kerbal: Kerbal): boolean {
		return this.kerbals.has(kerbal);
	}
	toJSON () {
		let result: GroupObj = jsonIncludes(this, ['type', 'name', 'text']) as GroupObj;
		let nameList = [];
		for (let kerbal of this.kerbals) {
			nameList.push(kerbal.name);
		}
		result.kerbals = nameList;
		return result;
	}
	/**
	 * Construct an group from the object returned from JSON.parse(JSON.stringify(group))
	 * @param  {Object} jsonObj JSON.parse'd group
	 * @param  {KDB} db         KDB to get kerbals from (Group stores names, not JS objects)
	 * @return {KNS.Group}      Revived Group
	 * @memberof KNS.Group
	 */
	static fromJSONObj (jsonObj: GroupObj, db: KDB): Group {
		if (jsonObj.type !== 'Group') {
			throw new KDBParseError('Not a group');
		}
		let group = new this(db.groupCounter);
		let nameList = jsonObj.kerbals;
		//@ts-ignore
		delete jsonObj.kerbals;
		//@ts-ignore
		Object.assign(group, jsonObj);
		for (let name of nameList) {
			const kerbal = db.getKerbal(name);
			if (kerbal === null) {
				throw new KDBParseError('Kerbal in group does not exist in KDB');
			}
			group.addKerbal(kerbal);
		}
		return group;
	}
	/**
	 * Equality check for groups
	 * @param  {KNS.Group} group1 First group to compare
	 * @param  {KNS.Group} group2 Second group to compare
	 * @return {Boolean}      If the two kerbals are equalivalent
	 * @memberof KNS.Group
	 */
	static equals (group1: Group, group2: Group): boolean {
		if (group1.name !== group2.name) {
			return false;
		}
		if (group1.text !== group2.text) {
			return false;
		}

		for (let kerbal of group1.kerbals) {
			let other = group2.getKerbal(kerbal.name);
			if (other === null) {
				return false;
			}
			if (!KNS.Kerbal.equals(kerbal, other)) {
				return false;
			}
		}
		for (let kerbal of group2.kerbals) {
			let other = group2.getKerbal(kerbal.name);
			if (other === null) {
				return false;
			}
		}
		return true;
	}
	/**
	 * Duplicate the group, (deep copy)
	 * @param  {Boolean} [deep=true] Whether to deep copy the kerbals
	 * @return {KNS.Group} Duplicated group
	 * @memberof KNS.Group
	 */
	duplicate (deep: boolean = true): Group {
		let result = new Group(0);
		result.name = this.name;
		result.text = this.text;
		for (let kerbal of this.kerbals) {
			if (deep) {
				result.addKerbal(kerbal.duplicate());
			} else {
				result.addKerbal(kerbal);
			}
		}
		return result;
	}
};


export class KDBParseError extends Error {
	constructor (...args: any) {
		super(...args);
		//@ts-ignore
		Error.captureStackTrace(this, this.constructor);
	}
};


/**
 * Kerbal database - used to store information on kerbals.
 * @property {Set<String>} kerbals Set of all kerbals in the db
 * @property {Map<Number, KNS.Group>} groups Mapping of groupIDs to groups
 * @property {Number} groupCounter Auto-incrementing counter for unique ids
 */
export class KDB implements KDB {
	kerbals: Set<string>;
	private __groupCounter: number;
	groups: Map<number, Group>;
	kerbalObjs: Map<string, Kerbal>;
	type: 'KDB' = 'KDB';
	private __displays: Set<KDBDisplay>;
	constructor () {
		this.kerbals = new Set();
		this.__groupCounter = 0;
		/**
		 * Mapping of groups
		 * @type {Map<Number, KNS.Group>}
		 */
		this.groups = new Map();
		/**
		 * Mapping of kerbal names to their objects
		 * @type {Map<String, KNS.Kerbal>}
		 * @private
		 */
		this.kerbalObjs = new Map();
		/**
		 * Set of displays to callback on changes
		 * @type {Set<KDBDisplay>}
		 * @private
		 */
		this.__displays = new Set();
	}
	/**
	 * Add a new kerbal
	 * @param {KNS.Kerbal} kerbalObj Kerbal to add
	 * @throws {Error} If kerbal already exists
	 */
	addKerbal (kerbalObj: Kerbal) {
		if (this.kerbals.has(kerbalObj.name)) {
			throw new Error('KDB already has kerbal');
		}
		this.kerbals.add(kerbalObj.name);
		this.kerbalObjs.set(kerbalObj.name, kerbalObj);
		for (let display of this.__displays) {
			display.addKerbal(kerbalObj);
		}
	}
	/**
	 * Get a kerbal by name
	 * @param  {String} name Name of kerbal to get
	 * @return {?KNS.Kerbal} Kerbal
	 */
	getKerbal (name: string): Kerbal | null {
		const result = this.kerbalObjs.get(name);
		if (result === undefined) {
			return null;
		} else {
			return result;
		}
	}
	/**
	 * Rename a kerbal, cleanly
	 * @param  {String} oldName Current name of kerbal
	 * @param  {String} newName New name for kerbal
	 * @throws {Error} If newName is already taken
	 * @throws {Error} If no kerbal has oldName
	 */
	renameKerbal (oldName: string, newName: string) {
		let kerbal = this.getKerbal(oldName);
		if (this.kerbals.has(newName)) {
			throw new Error('KDB already has kerbal');
		} else if (kerbal !== null) {
			kerbal.name = newName;
			this.kerbals.delete(oldName);
			this.kerbals.add(newName);
			this.kerbalObjs.delete(oldName);
			this.kerbalObjs.set(newName, kerbal);
		} else {
			throw new Error('Kerbal not found');
		}
		for (let group of this.groups.values()) {
			group.renameKerbal(oldName, newName);
		}
		for (let display of this.__displays) {
			display.renameKerbal(oldName, newName);
		}
	}
	/**
	 * Delete a kerbal
	 * @param  {String} name Name of kerbal to delete
	 * @throws {Error} If kerbal does not exist
	 */
	deleteKerbal (name: string) {
		let kerbal = this.getKerbal(name);
		if (kerbal === null) {
			throw new Error('Kerbal not found');
		}
		kerbal.delete();
		this.kerbals.delete(name);
		this.kerbalObjs.delete(name);
		for (let group of this.groups.values()) {
			group.deleteKerbal(kerbal);
		}
		for (let display of this.__displays) {
			display.deleteKerbal(kerbal);
		}
	}
	/**
	 * Convert self to json
	 * @return {Object} Object to pass to JSON.stringify
	 */
	toJSON (): KDBObj {
		// Sets and maps don't stringify well
		let result = jsonIncludes(this, ['type']) as KDBObj;
		result.kerbalObjs = setToArray(this.kerbalObjs); // Because we only need the values, this map is close enough to a set
		result.groups = setToArray(this.groups);
		return result;
	}
	/**
	 * Revive a kdb from json
	 * @param  {Object} jsonObj Object from JSON.parse
	 * @return {KDB}         Revived kdb
	 */
	static fromJSONObj (jsonObj: KDBJSONObj): KDB {
		if (jsonObj.type !== 'KDB') {
			throw new KDBParseError('Not a KDB');
		}
		let kdb = new this();
		kdb.kerbals = new Set();
		for (let kerbalObj of jsonObj.kerbalObjs) {
			let kerbal = Kerbal.fromJSONObj(kerbalObj);
			kdb.kerbals.add(kerbal.name);
			kdb.kerbalObjs.set(kerbal.name, kerbal);
		}

		let groups = jsonObj.groups || [];
		for (let groupObj of groups) {
			kdb.addGroup(Group.fromJSONObj(groupObj, kdb));
		}
		return kdb;
	}
	/**
	 * Revive a kdb from JSON
	 * @param  {String} json String from JSON.stringify(kdb)
	 * @return {KDB}         Revived kdb
	 */
	static fromJSON (json: string): KDB {
		return this.fromJSONObj(JSON.parse(json));
	}
	/**
	 * Equality check for KDBs
	 * @param  {KDB} thing1 First kdb to compare
	 * @param  {KDB} thing2 Second kdb to compare
	 * @return {Boolean}   If this and other are equalivalent
	 */
	static equals (thing1: KDB, thing2: KDB): boolean {
		for (let name of thing1.kerbals) {
			if (!thing2.kerbals.has(name)) {
				return false;
			}
		}
		for (let name of thing2.kerbals) {
			if (!thing1.kerbals.has(name)) {
				return false;
			}
		}
		for (let name of thing1.kerbals) {
			let ours = thing1.getKerbal(name)!;
			let theirs = thing2.getKerbal(name)!;
			if (!Kerbal.equals(ours, theirs)) {
				return false;
			}
		}
		return true;
	}
	/**
	 * Register a display to recieve callbacks on state changes
	 * @param {KDBDisplay} display Display to register
	 */
	addDisplay (display: KDBDisplay) {
		this.__displays.add(display);
	}
	/**
	 * Deregister a display
	 * @param  {KDBDisplay} display Display to deregister
	 */
	removeDisplay (display: KDBDisplay) {
		this.__displays.delete(display);
	}
	/**
	 * Add a new group, gives it a new id
	 * @param {KNS.Group} group Group to add
	 * @throws {Error} If group already exists
	 */
	addGroup (group: Group) {
		let id = this.groupCounter;
		group.id = id;
		if (this.groups.has(id)) {
			throw new Error('KDB already has group');
		}
		this.groups.set(id, group);
		for (let display of this.__displays) {
			display.addGroup(group);
		}
	}
	/**
	 * Get a group by id
	 * @param  {Number} groupID  Id of group to get
	 * @return {?KNS.Group}      Group with matching id
	 */
	getGroup (groupID: number): Group | null {
		const result = this.groups.get(groupID);
		if (result === undefined) {
			return null;
		} else {
			return result
		}
	}
	/**
	 * Remove a group
	 * @param  {Number} groupID Id of group to remove
	 * @throws {Error} If group does not exist
	 */
	removeGroup (groupID: number) {
		if (!this.groups.has(groupID)) {
			throw new Error('Group not found');
		}
		let group = this.groups.get(groupID)!;
		this.groups.delete(groupID);
		for (let display of this.__displays) {
			display.removeGroup(group);
		}
	}
	get groupCounter () {
		let result = this.__groupCounter;
		this.__groupCounter += 1;
		return result;
	}
};


/**
 * Kerbal NameSpace
 * @namespace KNS
 */
let KNS =  {
	/**
	 * Array of names of all the places in KSP
	 * @constant
	 * @type {String[]}
	 * @memberof KNS
	 */
	places: KSP_PLACES,
	Kerbal: Kerbal,
	blankPlaceList: blankPlaceList,
	/**
	 * Converts a UI input to job value
	 * @param  {String} value Text representing job
	 * @return {Number}       Value of job
	 * @memberof KNS
	 */
	valueToJob: function (value: KSP_PLACE_DEPTH): string {
		switch (value) {
			case 0:
				return '';
			case 1:
				return 'Flyby';
			case 2:
				return 'Sub-Orbital';
			case 3:
				return 'Orbit';
			case 4:
				return 'Landing';
			default:
				return '????';
		}
	},
	/**
	 * Converts a job value to text
	 * @param  {Number} job Job value
	 * @return {String}     Text representing job
	 * @memberof KNS
	*/
	jobToValue: function (job: string): KSP_PLACE_DEPTH {
		switch (job) {
			case '':
				return 0;
			case 'Flyby':
				return 1;
			case 'Sub-Orbital':
				return 2;
			case 'Orbit':
				return 3;
			case 'Landing':
				return 4;
			default:
				return 0;
		}
	},
	/**
	 * Highest depth for a job
	 * @const {Number}
	 * @memberof KNS
	 */
	MAX_JOB_VALUE: MAX_JOB_VALUE,
	Group: Group,
	KDBParseError: KDBParseError,
};

class empty {};

/**
 * A KerbalDisplay Mixin that does nothing. Use this when you don't need all the methods
 * @param  superclss Class to mix KerbalDisplay methods into
 * @return  Class that implements KerbalDisplay
 */
export const BlankKerbalDisplayMixin = (superclass: GConstructor) => {
	abstract class BlankKerbalDisplayMixin extends superclass implements KerbalDisplay {
		abstract data: Kerbal | null;
		constructor (...args: any) {
			super(...args);
		}
		updateData () {}
		showJob (_place: KSP_PLACES_T) {}
		delete () {}
	};
	return BlankKerbalDisplayMixin;
};
Elements.common.BlankKerbalDisplayMixin = BlankKerbalDisplayMixin;


/**
 * A KerbalDisplay that only displays jobs
 * re: delete - The consumer of this should deal with this
 * re: updateData - This doesn't build a kerbal tag
 * @implements KerbalDisplay
 * @augments BlankKerbalDisplay
 * @property {KNS.Kerbal} data kerbal that this represents
 * @property {HTMLElement} display display of the kerbal's jobs
 */
class KerbalJobDisplay extends BlankKerbalDisplayMixin(empty) implements KerbalDisplay {
	private __jobDisplay: Record<KSP_PLACES_T, null | HTMLParagraphElement>;
	display: HTMLDivElement;
	data: Kerbal | null = null;
	constructor () {
		super();
		this.__jobDisplay = KNS.blankPlaceList(null);
		this.display = document.createElement('div');
	}
	/**
	 * Update the display for a job
	 * @param  {String} place Place to update display
	 */
	showJob (place: KSP_PLACES_T) {
		requestAnimationFrame(() => {
			if (this.data === null) {return;}
			let value = this.data.jobs[place];
			if (value > 0) {
				if (this.__jobDisplay[place] === null) {
					// A display element has not been made
					this.__jobDisplay[place] = this.makeJobElement(place, value);
					this.display.appendChild(this.__jobDisplay[place]!);
				} else {
					this.changeJobElement(this.__jobDisplay[place]!, place, value);
					if (!(this.display.contains(this.__jobDisplay[place]))) {
						// A display element has been made, but has since been removed
						this.display.appendChild(this.__jobDisplay[place]!);
					}
				}
			} else {
				if (this.display.contains(this.__jobDisplay[place])) {
					this.display.removeChild(this.__jobDisplay[place]!);
				}
			}
		});
	}
	/**
	* Make a display element
	* @param  {String} place Location
	* @param  {Number} value Depth of visited required
	* @return {HTMLElement} Element representing place+value
	*/
	makeJobElement (place: KSP_PLACES_T, value: KSP_PLACE_DEPTH): HTMLParagraphElement {
		let p = document.createElement('p');
		p.textContent = place + ' ' + KNS.valueToJob(value);
		return p;
	}
	/**
	 * Update a job display element
	 * @param  {HTMLElement} element Job display element
	 * @param  {String} place   Destination of mission
	 * @param  {int} value   Depth of mission
	 */
	changeJobElement (element: HTMLElement, place: KSP_PLACES_T, value: KSP_PLACE_DEPTH) {
		element.textContent = place + ' ' + KNS.valueToJob(value);
	}
};
Elements.inherits.KerbalJobDisplay = KerbalJobDisplay;

/**
* A KDBDisplay mixin that does nothing. Use this to implement methods you don't need.
* Note: For now, it's a good idea to use this if you can't inherit BlankKDBDisplay,
* as new methods WILL be added to KDBDisplay.
* See BlankKDBDisplay for documentation
* @param  superclass Class to mix KDBDisplay methods into
* @return  Class that implements KDBDisplay
*/
export const BlankKDBDisplayMixin = (superclass: GConstructor) => {
	abstract class mixin extends superclass implements KDBDisplay{
		abstract database: string | null;
		constructor (...args: any) {
			super(...args);
			// this.database = this.database || null;
		}
		/**
		 * Fired after addKerbal is called
		 * @param {KNS.Kerbal} kerbal The added kerbal
		 */
		addKerbal (_name: Kerbal) {}
		/**
		 * Fired after a kerbal has been deleted
		 * @param  {KNS.Kerbal} kerbal The deleted kerbal
		 */
		deleteKerbal (_name: Kerbal) {}
		/**
		 * Fired after a kerbal has been renamed
		 * @param  {String} oldName Name of kerbal before rename
		 * @param  {String} newName Current name of kerbal
		 */
		renameKerbal (_oldName: string, _newName: string) {}
		/**
		 * Fired after a group is added
		 * @param {KNS.Group} group The added group
		 */
		addGroup (_groupID: Group) {}
		/**
		 * Fired after a group is removed
		 * @param {KNS.Group} group The removed group
		 */
		removeGroup (_groupID: Group) {}
	};
	return mixin;
};
Elements.common.BlankKDBDisplayMixin = BlankKDBDisplayMixin;


/**
 * A KDBDisplay that does nothing. Use this to implement methods you don't need.
 * Note: For now, it's a good idea to inherit from this, as new methods WILL be added to KDBDisplay
 * @implements KDBDisplay
 * @property {KDBDisplay} data KDB that this represents
 */
const BlankKDBDisplay = BlankKDBDisplayMixin(empty);
Elements.classes.BlankKDBDisplay = BlankKDBDisplay;


//@ts-ignore
window.KNS = KNS;
//@ts-ignore
window.KDB = KDB;

Elements.loaded('KDB');
Elements.loaded('KNS');
Elements.loaded('KNS.Kerbal');
Elements.loaded('KNS.Group');
