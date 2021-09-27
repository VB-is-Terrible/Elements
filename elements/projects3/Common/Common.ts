import {GConstructor, jsonIncludes} from '../../elements_helper.js';
import {} from '../../draggable/Common/Common.js'
import {ItemDragStartP1, ItemDrop, DragDetail} from '../../draggable/types.js';
import type {resource_id} from '../../draggable/types.js';


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

export type id = number;

const UpdateWrapperBase = UpdateWrapper(class {});


export interface ProjectObj {
	id: id;
	name: string;
	desc: string;
	tags: string[];
}

export class Project extends UpdateWrapperBase implements ProjectObj {
        id: id;
        name: string;
        desc: string;
	tags: string[];
	constructor(id: id, name: string, desc = '', tags = []) {
		super();
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.tags = tags;
	}
	static fromJSONObj(obj: ProjectObj) {
		// TODO: Fill out
		return new Project(obj.id, obj.name, obj.desc);
	}
	toJSON() {
		return jsonIncludes(this, ['id', 'name', 'desc', 'tags']);
	}
};

export interface ProjectGroupObj {
	id: id;
	name: string;
	desc: string;
	projects: Array<id>;
};

export interface ProjectGroupNetwork {
	id: id;
	name: string;
	desc: string | undefined;
	projects: Array<id>;
}

export class ProjectGroup extends UpdateWrapperBase implements ProjectGroupObj {
	id: id;
	name: string;
	desc: string;
	projects: Array<id>;
	constructor(id: id, name: string, desc: string, projects: Array<number> = []) {
		super();
		this.id = id;
		this.name = name;
		this.desc = desc;
		this.projects = projects;
	}
	/// TODO: Add json methods
	static fromJSONObj(obj: ProjectGroupObj) {
		return new ProjectGroup(obj.id, obj.name, obj.desc, obj.projects)
	}
	static fromNetworkObj(obj: ProjectGroupNetwork) {
		return new ProjectGroup(obj.id, obj.name, obj.desc ?? '', obj.projects)
	}
	toJSON() {
		return jsonIncludes(this, ['id', 'name', 'desc', 'projects']);
	}
}



export type SystemNetworkObj = {
	name: string,
	groups: ProjectGroupNetwork[],
	projects: ProjectObj[],
};


export interface SystemObj {
	projects: Map<id, Project>;
	project_groups: Map<number, ProjectGroup>;
}

export class System implements SystemObj {
	projects: Map<id, Project> = new Map();
	project_groups: Map<id, ProjectGroup> = new Map();
	remote_location: string;
	name: string;
	constructor(name: string, remote_location: string) {
		this.remote_location = remote_location;
		this.name = name;
	}
	static fromNetworkObj(obj: SystemNetworkObj, remote_location: string) {
		const result = new System(obj.name, remote_location);
		for (const project_obj of obj.projects) {
			const project = Project.fromJSONObj(project_obj);
			result.projects.set(project_obj.id, project);
		}
		for (const group_obj of obj.groups) {
			const project_group = ProjectGroup.fromNetworkObj(group_obj);
			result.project_groups.set(group_obj.id, project_group);
		}
		return result;
	}
	get_project_by_id(id: number) {
		return this.projects.get(id);
	}
	get_project_group_by_id(id: number) {
		return this.project_groups.get(id);
	}
	toJSON() {
		return {
			projects: Object.fromEntries(this.projects),
			project_groups: Object.fromEntries(this.project_groups),
		}
	}
}

export class Projects3DragStart extends ItemDragStartP1 {
	readonly source_id: id;
	constructor(effect_allowed: resource_id,
	            event: DragEvent,
	            source: Element,
	            source_id: id) {
		super(effect_allowed, event, source);
		this.source_id = source_id;
	}
}

export class Projects3DragTransfer {
	readonly source_id: id;
	readonly group_id: id;
	constructor(source_id: id, group_id: id) {
		this.source_id = source_id;
		this.group_id = group_id;
	}
}

export class Projects3Drop {
	readonly project_id: id;
	readonly src_group: id;
	readonly dst_group: id;
	constructor(proj_id: id, src_group: id, dst_group: id) {
		this.project_id = proj_id
		this.src_group = src_group;
		this.dst_group = dst_group;
	}
	static readonly event_string = 'projects3-item-drop';
}
