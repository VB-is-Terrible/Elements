'use strict'

/**
 * @event Projects.Project#update
 * @type {Object}
 * @property {String} target Name of property changed
 */

/**
 * Interface for display of a Projects.Project
 * @interface ProjectDisplay
 */
/**
 * @function update
 * @description Fired upon a change event
 * @name ProjectDisplay.update
 * @param {Projects.Project#update} event Event been fired
 */

/**
 * Project namespace
 * @namespace Projects
 */
const Projects = {
	ProjectParseError: class extends Error {
		constructor (...args) {
			super(...args);
			Error.captureStackTrace(this, this.constructor);
		}
	},
	STATUS_CODES_MAJOR: {
		0: 'Not started',
		1: 'In progress',
		2: 'Completed',
		'-1': 'Unknown status',
	},
	STATUS_CODES_MINOR: {
		0: null,
		1: 'Awaiting dependencies',
	},
	MAX_STATUS: 2,
	PROGRESS_STATUS: 1,
	/**
	 * Object describing the status of a project
	 * @property {Number} major The overall status of a project. These are ascending
	 * @property {Number} minor A detailed status on the project. Not in any order
	 * @property {String} major_code A string description of the major code
	 * @property {String} minor_code A string description of the minor code
	 * @type {Object}
	 */
	Status: class Status {
		constructor (major, minor = 0) {
			this.major = major;
			this.minor = minor;
		}
		get major_code () {
			return Projects.STATUS_CODES_MAJOR[this.major];
		}
		get minor_code () {
			if (this.minor !== 0) {
				return Projects.STATUS_CODES_MINOR[this.minor];
			} else {
				return this.major_code;
			}
		}
		/**
		 * Restores a status object from JSON
		 * @param  {Object} obj JSON object to revive
		 * @return {Projects.Status}     Revived status
		 * @memberof Projects.Status
		 */
		static fromJSONObj (obj) {
			let status = new this(obj.major, obj.minor);
			return status;
		}
	},
	/**
	 * Class representing project object. Shared with Server
	 * @property {String} name Name of the project
	 * @property {Number} id Project ID. Should be unique.
	 * @property {String} desc Description of the project
	 * @property {Number} required Amount of progress required to complete this project
	 * @property {Number} progress Current progress to completion
	 * @property {Number} meta Type of project
	 * @property {Number[]} dependencies List of dependencies as project IDs
	 * @property {Projects.Status} status Status object for the project
	 * @property {Booelean} counter If to use a counter to track progress instead of made->started->finished
	 * @type {Object}
	 */
	Project: class Project {
		constructor (system, name, id, desc = '', required = 0,
		             status = null) {
			this._system = system;
			this._name = name;
			this._desc = desc;
			this._dependencies = [];
			this.id = id;
			if (required === 0) {
				this._counter = false;
				this._required = Projects.MAX_STATUS;
			} else {
				this._counter = true;
				this._required = required;
			}
			this._progress = 0;
			this._meta = 0;
			if (status !== null) {
				this._status = status;
			} else {
				this._status = new Projects.Status(0);
			}

			this._displays = new Set();
			this.type = 'Project';
		}
		get name () {
			return this._name;
		}
		set name (value) {
			this._name = value;
			this.dispatchUpdate();
		}
		get desc () {
			return this._desc;
		}
		set desc (value) {
			this._desc = value;
			this.dispatchUpdate();
		}
		get dependencies () {
			return this._dependencies;
		}
		set dependencies (value) {
			this._dependencies = value;
			this.dispatchUpdate();
		}
		get required () {
			return this._required;
		}
		set required (value) {
			this._required = value;
			this.dispatchUpdate();
		}
		get progress () {
			return this._progress;
		}
		set progress (value) {
			this._progress = value;
			this.dispatchUpdate();
		}
		get meta () {
			return this._meta;
		}
		set meta (value) {
			this._meta = value;
			this.dispatchUpdate();
		}
		get counter () {
			return this._counter;
		}
		set counter (value) {
			this._counter = value;
			this.dispatchUpdate();
		}
		/**
		 * Update displays that something has changed
		 * @memberof Projects.Project
		 */
		dispatchUpdate () {
			// TODO: Implement
		}
		/**
		 * Add a display to listen to changes
		 * @param {ProjectDisplay} display Display to notify
		 * @memberof Projects.Project
		 */
		addDisplay (display) {
			this._displays.add(display);
		}
		/**
		 * Stop a display from been notified of changes
		 * @param  {ProjectDisplay} display Display to stop notifying
		 * @memberof Projects.Project
		 */
		removeDisplay (display) {
			this._displays.delete(display);
		}
		get status () {
			return this._status;
		}
		set status (value) {
			this._status = value;
			this.dispatchUpdate();
		}
		/**
		 * Restores the project from a JSON object
		 * @param  {Object} obj    JSON object to revive from
		 * @param  {Projects.System} system System to attach project to
		 * @return {Projects.Project}        Revived project
		 * @memberof Projects.Project
		 */
		static fromJSONObj(obj, system) {
			if (obj.type !== 'Project') {
				throw new Projects.ProjectParseError('Not a Project representation');
			}
			let status = Projects.Status.fromJSONObj(obj.status);
			let project = new this(system, obj.name, obj.id, obj.desc, obj.required, status);
			project.counter = obj.counter;
			project.dependencies = obj.dependencies;
			project.progress = obj.progress;
			project.meta = obj.meta;
			return project
		}
		/**
		 * Convert a project object to JSON
		 * @return {Object} [description]
		 * @memberof Projects.Project
		 */
		toJSON () {
			return Elements.jsonIncludes(this, this.constructor.json_props);
		}
		/**
		 * List of properties needed to store a project as JSON
		 * @type {List<String>}
		 * @memberof Projects.Project
		 */
		static get json_props () {
			return ['name', 'desc', 'dependencies', 'required', 'progress', 'meta', 'counter'];
		}
	},
	/**
	 * Overall Project Container and manager
	 * @property {Map<Number, Projects.Project>} projects A map of project IDs to project objects
	 * @property {Number} version Version number of the system, used to get new patches. No guarantee on linearity
	 * @type {Object}
	 */
	System: class System {
		constructor() {
			this.projects = new Map();
			this.version = 0;
		}
		/**
		 * Revive a system from raw JSON
		 * @param  {String} json Raw JSON to revive
		 * @return {Projects.System}      Revived System
		 * @memberof Projects.System
		 */
		static fromJSON(json) {
			return this.fromJSONObj(JSON.parse(json))
		}
		/**
		 * Revive a system from JSON
		 * @param  {Object} obj  JSON object to revive
		 * @return {Projects.System}      Revived System
		 * @memberof Projects.System
		 */
		static fromJSONObj(obj) {
			if (obj.type !== 'System') {
				throw new Projects.ProjectParseError('Not a System');
			}
			let system = new Projects.System();
			system.version = obj.version
			for (let project_key in obj.projects) {
				let projectObj = obj.projects[project_key]
				let project = Projects.Project.fromJSONObj(projectObj, system);
				system.projects.set(project.id, project);
			}
			return system;
		}
		/**
		 * Get a project by ID
		 * @param  {Number} id ID of project to get
		 * @return {Projects.Project}    Project with corresponding ID
		 * @memberof Projects.System
		 */
		get_event_by_id (id) {
			return this.projects.get(id);
		}
		/**
		 * Send a project to the server to be created.
		 * Assuming no errors, the server will send back a create patch
		 * @param  {Projects.Project}  project Project to create
		 * @return {Promise}           If sending the project was successful
		 * @memberof Projects.System
		 */
		async add_project (project) {
			let message = JSON.stringify([project]);
			console.log('Sending: ', message);
			let form_data = new FormData();
			form_data.append('create', message);
			form_data.append('version', this.version)
			let fetch_promise;
			try {
				fetch_promise =  fetch(window.location.origin + '/create', {
					method: 'POST',
					body: form_data,
				});
			} catch (e) {
				alert('Failed to connect to server');
				throw e;
			}
			try {
				this.patch(fetch_promise);
				return true;
			} catch (e) {
				return false;
			}
		}
		/**
		 * Apply a patch from the server to the system.
		 * Only creating projects has been implemented
		 * @param  {Promise}  promise Promise from pinging the server
		 * @memberof Projects.System
		 */
		async patch (promise) {
			let updates;
			try {
				let response = await promise;
				updates = await response.json();
			} catch (e) {
				alert('Bad response from server');
				throw e;
			}
			console.log ('Would apply update: ', updates);
			for (let patch of updates.patches) {
				for (let create of patch.create) {
					this._patch_add_project(create);
				}
			}
			this.version = updates.version
		}
		/**
		 * Add a project to the system
		 * @param  {String}  project_obj JSON string of project to add
		 * @private
		 * @memberof Projects.System
		 */
		_patch_add_project (project_json) {
			let project_obj = JSON.parse(project_json);
			let project = Projects.Project.fromJSONObj(project_obj, this);
			this.projects.set(project.id, project);
			// TODO: Move this into own element
			let projects = document.querySelector('#projects');
			let display = document.createElement('elements-projects-project-display');
			display.data = project;
			projects.append(display);

		}
		async update () {
			let form_data = new FormData();
			form_data.append('version', this.version)
			let fetch_promise;
			try {
				fetch_promise =  fetch(window.location.origin + '/update', {
					method: 'POST',
					body: form_data,
				});
			} catch (e) {
				alert('Failed to connect to server');
				throw e;
			}
			try {
				this.patch(fetch_promise);
				return true;
			} catch (e) {
				return false;
			}

		}
	},
	/**
	 * Standard datatype for dataTransfer when passing project ids to a unknown reciever
	 * @type {String}
	 */
	common_type: 'projects/common',
};

Elements.loaded('projects-Project');

const test = () => {
	const base1 = {
		"type":"Project",
		"name":"a",
		"desc":"aa",
		"dependencies":[],
		"required":2,
		"progress":0,
		"meta":1,
		"status": {
			"major": 2,
			"minor": 0,
		},
	};
	const base2 = {
		"type":"Project",
		"name":"b",
		"desc":"bb",
		"dependencies":[],
		"required":2,
		"progress":0,
		"meta":0,
		"status": {
			"major": 0,
			"minor": 0,
		},
	};
	const compare_project = (proj1, proj2) => {
		const props = ['name', 'desc', 'required', 'progress', 'meta'];
		for (let prop of props) {
			if (proj1[prop] !== proj2[prop]) {
				console.log('Mismatched property ', prop);
				return false;
			}
		}
		// Check depends
		let [set1, set2] = [new Set(proj1.dependencies), new Set(proj2.dependencies)];
		if (set1.size !== proj1.dependencies.length) {
			console.log('Duplicate dependencies');
			return false;
		}
		if (set2.size !== proj2.dependencies.length) {
			console.log('Duplicate dependencies');
			return false;
		}
		if (set1.size !== set2.size) {
			console.log('Mismatched dependencies');
		}
		for (let depend of set1) {
			if (!set2.has(depend)) {
				console.log('Mismatched dependencies');
				return false;
			}
		}
		return true;
	};
	let promises = [];
	for (let test of [base1, base2]) {
		let resolve_f, reject_f;
		let promise = new Promise((resolve, reject) => {
			[resolve_f, reject_f] = [resolve, reject];
		});
		promises.push(promise);
		const data1 = new Projects.System();
		let project_js = Projects.Project.fromJSONObj(test, data1);

		data1._patch_add_project = async (project_obj) => {
			let project_py = Projects.Project.fromJSONObj(project_obj, data1);
			if (!compare_project(project_js, project_py)) {
				reject_f();
			} else {
				resolve_f();
			}
		};
		data1.add_project(project_js);
	}
	(async () => {
		try {
			await Promise.all(promises);
			console.log('Passed tests');
		} catch (e) {
			console.log('Failed tests');
			throw e;
		}
	})();
}
