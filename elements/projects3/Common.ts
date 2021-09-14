import {GConstructor} from '../elements_helper.js';


export interface UpdateListener {
	update: () => void,
}

const CLEANUP_BREAK = 30 * 1000;

export const UpdateWrapper = (Base: GConstructor) => {
	return class UpdateWrapped extends Base {
		#listeners: Set<WeakRef<UpdateListener>> = new Set();
		#last_cleanup: number;
		#finalizer: FinalizationRegistry<WeakRef<UpdateListener>>;
		#callback: (heldValue: WeakRef<UpdateListener>) => void;
		constructor(...args: unknown[]) {
			super(...args);
			this.#last_cleanup = Date.now();
			this.#callback = (heldValue: WeakRef<UpdateListener>) => {
				this.#removeRef(heldValue);
			};
			this.#finalizer = new FinalizationRegistry(this.#callback);
		}
		addListener(listener: UpdateListener) {
			const ref = new WeakRef(listener);
			this.#listeners.add(ref);
			this.#finalizer.register(listener, ref, listener)
		}
		removeListener(listener: UpdateListener) {
			let ref = undefined;
			for (const test_ref of this.#listeners) {
				if (test_ref.deref() === listener) {
					ref = test_ref;
					break;
				}
			}
			if (ref !== undefined) {
				this.#listeners.delete(ref);
				this.#finalizer.unregister(listener);
			}
		}
		#removeRef(ref: WeakRef<UpdateListener>) {
			this.#listeners.delete(ref);
			console.log('Removed a ref');
		}
		update() {
			this.#cleanup();
			for (const listener of this.#listeners) {
				listener.deref()!.update();
			}
		}
		#cleanup() {
			if (Date.now() - this.#last_cleanup < CLEANUP_BREAK) {
				return;
			} else {
				this.#last_cleanup = Date.now();
			}
			for (const ref of this.#listeners) {
				if (ref.deref() === undefined) {
					this.#listeners.delete(ref);
				}
			}
		}
	}
}

type id = number;

const UpdateWrapperBase = UpdateWrapper(class {});


export interface ProjectObj {
	id: id;
	name: string;
	desc: string;
	tags: string[];
	parent: id;
}

export class Project extends UpdateWrapperBase implements ProjectObj {
        id: id;
        name: string;
        desc: string;
	tags: string[];
	parent: id;
	constructor(id: id, name: string, desc = '', tags = [], parent = -1) {
		super();
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.tags = tags;
		this.parent = parent;
	}
	static fromJSONObj(obj: ProjectObj) {
		// TODO: Fill out
		return new Project(obj.id, obj.name, obj.desc);
	}
};

export interface ProjectGroupObj {
	id: id;
	name: string;
	desc: string;
	projects: Array<id>;
	primary: boolean;
};

export class ProjectGroup extends UpdateWrapperBase implements ProjectGroupObj {
	id: id;
	name: string;
	desc: string;
	projects: Array<id>;
	primary: boolean;
	constructor(id: id, name: string, desc: string, projects: Array<number> = [], primary = false) {
		super();
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.projects = projects;
		this.primary = primary
	}
	/// TODO: Add json methods
	static fromJSONObj(obj: ProjectGroupObj) {
		return new ProjectGroup(obj.id, obj.name, obj.desc, obj.projects, obj.primary)
	}

}


export interface SystemNetworkObj {
	projects: {[key: number]: ProjectObj};
	project_groups: {[key: number]: ProjectGroupObj}
}


export interface SystemObj {
	projects: Map<id, Project>;
	project_groups: Map<number, ProjectGroup>;
}

export class System implements SystemObj {
	projects: Map<id, Project> = new Map();
	project_groups: Map<number, ProjectGroup> = new Map();
	remote_location = '';
	static fromNetworkObj(obj: SystemNetworkObj) {
		const result = new System();
		for (const id in obj.projects) {
			const project = Project.fromJSONObj(obj.projects[id]);
			result.projects.set(parseInt(id), project);
		}
		for (const id in obj.project_groups) {
			const project_group = ProjectGroup.fromJSONObj(obj.project_groups[id]);
			result.project_groups.set(parseInt(id), project_group);
		}
		return result;
	}
	get_project_by_id(id: number) {
		return this.projects.get(id);
	}
	get_project_group_by_id(id: number) {
		return this.project_groups.get(id);
	}
}
