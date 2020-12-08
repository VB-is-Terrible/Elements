import {Elements} from '../../elements_core.js';

export class ProjectParseError extends Error {
	constructor (...args: any[]) {
		super(...args);
		//@ts-ignore
		if (Error.captureStackTrace) {
		//@ts-ignore
			Error.captureStackTrace(this, this.constructor)
		}
		this.name = 'ProjectParseError';
	}
};

export const STATUS_CODES_MAJOR: Map<number, string> = new Map([
	[0, 'Not started'],
	[1, 'In progress'],
	[2, 'Completed'],
	[-1, 'Unknown status'],
]);

export const STATUS_CODES_MINOR: Map<number, string> = new Map([
	[0, ''],
	[1, 'Awaiting dependencies'],

]);


export const MAX_STATUS = 2;
export const PROGRESS_STATUS = 1;

export interface StatusObj { major: number; minor: number;};

/**
 * Object describing the status of a project
 * @property {Number} major The overall status of a project. These are ascending
 * @property {Number} minor A detailed status on the project. Not in any order
 * @property {String} major_code A string description of the major code
 * @property {String} minor_code A string description of the minor code
 * @type {Object}
 */
export class Status {
        major: number;
        minor: number;
	constructor (major: number, minor = 0) {
		this.major = major;
		this.minor = minor;
	}
	get major_code () {
		return STATUS_CODES_MAJOR.get(this.major);
	}
	get minor_code () {
		if (this.minor !== 0) {
			return STATUS_CODES_MINOR.get(this.minor);
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
	static fromJSONObj (obj: StatusObj): Status {
		let status = new this(obj.major, obj.minor);
		return status;
	}

};

export interface ProjectObj {
	id: number;
	name: string;
	desc: string;
	status: StatusObj;
}

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
export class Project {
        id: number;
        name: string;
        desc: string;
	status: Status;
	constructor(id: number, name: string, desc = '') {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.status = new Status(0);
	}
	static fromJSONObj(obj: ProjectObj) {
		const result = new this(obj.id, obj.name, obj.desc);
		result.status = Status.fromJSONObj(obj.status);
		return result;
	}
};

export interface ProjectGroupObj {
	id: number;
	name: string;
	desc: string;
	projects: Array<ProjectObj>;
};

export class ProjectGroup {
	id: number;
	name: string;
	desc: string;
	projects: Array<UpdateWrapper<Project>>;
	constructor(id: number, name: string, desc = '') {
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.projects = [];
	}
	static fromJSONObj(obj: ProjectGroupObj) {
		const result = new ProjectGroup(obj.id, obj.name, obj.desc);
		for (const proj_obj of obj.projects) {
			const project = Project.fromJSONObj(proj_obj);
			result.projects.push(new UpdateWrapper(project));
		}
		return result;
	}
}

export interface SystemObj {
	project_groups: Array<ProjectGroupObj>;
};

export class System {
	projects: Map<number, UpdateWrapper<Project>> = new Map();
	project_groups: Map<number, UpdateWrapper<ProjectGroup>> = new Map();
	version = 0;
	remote_location = '';
	static fromJSONObj(obj: SystemObj) {
		const result = new System();
		for (const pg_obj of obj.project_groups) {
			const pg = ProjectGroup.fromJSONObj(pg_obj);
			const watcher = new UpdateWrapper(pg)
			result.project_groups.set(pg.id, watcher);
			for (const project_watcher of pg.projects) {
				const project = project_watcher.data;
				result.projects.set(project.id, project_watcher);
			}
		}
		return result;
	}
	get_project_by_id(id: number) {
		return this.projects.get(id);
	}
	get_project_group_by_id(id: number) {
		return this.project_groups.get(id);
	}
	async add_project(project: Project) {
		let message = JSON.stringify(project);
		console.log('Sending: ', message);
		let form_data = new FormData();
		form_data.append('create_p', message);
		form_data.append('version', this.version.toString());
		this._send_patch(form_data);
	}
	async add_project_group(pg: ProjectGroup) {
		let message = JSON.stringify(pg);
		console.log('Sending: ', message);
		let form_data = new FormData();
		form_data.append('create_pg', message);
		form_data.append('version', this.version.toString());
		this._send_patch(form_data);
	}
	async _send_patch(form_data: FormData) {
		let response;
		try {
			response = fetch(this.remote_location + '/change', {
				method: 'POST',
				body: form_data,
			});
		} catch (e) {
			alert('Failed to connect to server');
			throw e;
		}
		this._patch(response);
	}
	async _patch(fetch_response: Promise<Response>) {
		const response = await fetch_response;
		let updates;
		try {
			updates = await response.json();
		} catch (e) {
			alert('Bad response from server');
			throw e;
		}
		console.log ('Would apply update: ', updates);
		
	}
}

export interface UpdateListener<T> {
	(data: T): void;
}

const CLEANUP_BREAK = 30 * 1000;


export class UpdateWrapper<T> {
	data: T;
	listeners: Set<WeakRef<UpdateListener<T>>> = new Set();
	_last_cleanup: number;
	finalizer: FinalizationRegistry<WeakRef<UpdateListener<T>>>;
	_callback: (heldValue: WeakRef<UpdateListener<T>>) => void;
	constructor(data: T) {
		this.data = data;
		this._last_cleanup = Date.now();
		this._callback = (heldValue: WeakRef<UpdateListener<T>>) => {
			this._removeRef(heldValue);
		};
		this.finalizer = new FinalizationRegistry(this._callback);
	}
	addListener(listener: UpdateListener<T>) {
		const ref = new WeakRef(listener);
		this.listeners.add(ref);
		this.finalizer.register(listener, ref, listener)
	}
	removeListener(listener: UpdateListener<T>) {
		let ref = undefined;
		for (const test_ref of this.listeners) {
			if (test_ref.deref() === listener) {
				ref = test_ref;
				break;
			}
		}
		if (ref !== undefined) {
			this.listeners.delete(ref);
			this.finalizer.unregister(listener);
		}
	}
	_removeRef(ref: WeakRef<UpdateListener<T>>) {
		this.listeners.delete(ref);
		console.log('Removed a ref');
	}
	update() {
		this._cleanup();
		for (const listener of this.listeners) {
			listener.deref()!(this.data);
		}
	}
	_cleanup() {
		if (Date.now() - this._last_cleanup < CLEANUP_BREAK) {
			return;
		} else {
			this._last_cleanup = Date.now();
		}
		for (const ref of this.listeners) {
			if (ref.deref() === undefined) {
				this.listeners.delete(ref);
			}
		}
	}
}

Elements.loaded('projects2-Project');
