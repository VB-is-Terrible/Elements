const recommends: Array<string> = ['draggable-item'];
const requires: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {backbone4, setUpAttrPropertyLink} from '../../../elements_backbone.js';
import {CustomComposedEvent} from '../../../elements_helper.js';
import {ProjectObj, Projects3DragStart} from '../../Common/Common.js';
import {ItemDragStartP1, read_details} from '../../../draggable/types.js'


Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects3ProjectDisplay';
/**
 * [Projects3ProjectDisplay Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class Projects3ProjectDisplay extends backbone4 {
	#title: HTMLParagraphElement;
	#desc: HTMLParagraphElement;
	#link: HTMLAnchorElement;
	#firing = false;
	project_id: number = -1;
	name!: string;
	desc!: string;
	tags: string[] = [];
	href!: string;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		this.#title = template.querySelector('.name') as HTMLParagraphElement;
		this.#desc = template.querySelector('p.desc') as HTMLParagraphElement;
		this.#link = template.querySelector('#editlink') as HTMLAnchorElement;

		//Fancy code goes here
		shadow.appendChild(template);
		setUpAttrPropertyLink(this, 'name', '', (name: string) => {
			this.#title.textContent = name;
		});
		setUpAttrPropertyLink(this, 'desc', '', (desc: string) => {
			const one_line = desc.split('\n')[0];
			this.#desc.textContent = one_line;
		});
		setUpAttrPropertyLink(this, 'href', '', (href: string) => {
			if (href === '') {
				this.#link.removeAttribute('href');
			} else {
				this.#link.href = href;
			}
		});
		this.addEventListener(ItemDragStartP1.event_string, (e) => {
			if (this.#firing) {
				this.#firing = false;
				return;
			}
			this.#item_drag_start(e as CustomEvent);
			e.stopPropagation();
		});
	}
	#item_drag_start(event: CustomEvent<ItemDragStartP1>) {
		const detail = read_details(event, ItemDragStartP1);
		const new_detail = new Projects3DragStart(
			detail.effect_allowed,
			detail.event,
			detail.source,
			this.project_id);
		const ev = CustomComposedEvent(Projects3DragStart.event_string, new_detail);
		this.#firing = true;
		this.dispatchEvent(ev);
	}
	static get observedAttributes() {
		return ['name', 'desc', 'href'];
	}
	static fromProject(project: ProjectObj): Projects3ProjectDisplay {
		const result = new this();
		result.project_id = project.id;
		result.desc = project.desc;
		result.name = project.name;
		result.tags = project.tags;
		return result;
	}

}

export default Projects3ProjectDisplay;

Elements.load(Projects3ProjectDisplay, 'elements-projects3-project-display');
