const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, setUpAttrPropertyLink} from '../../elements_backbone.js';
import {booleaner, get_border_box} from '../../elements_helper.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'ContainerSidebar';
/**
 * [ContainerSidebar Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class ContainerSidebar extends backbone4 {
	toggled!: boolean;
	#popup;
	#ro;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		const button = template.querySelector('button.toggle') as HTMLButtonElement;
		this.#popup = template.querySelector('div.toggle') as HTMLDivElement;
		const slot_container = template.querySelector('div.slotcontainer') as HTMLDivElement;
		this.#ro = new ResizeObserver((resizeList: ResizeObserverEntry[]) => {
			requestAnimationFrame(() => {
				const size = get_border_box(resizeList[resizeList.length - 1]).blockSize * -1 + 1;
				this.#popup.style.setProperty('--popupHeight', `${size}px`);
			});
		});
		this.#ro.observe(slot_container);
		button.addEventListener('click', () => {
			this.toggled = !this.toggled;
		});
		this.style.setProperty('--animation_duration_long', `${Elements.animation.LONG_DURATION/1000}s`);
		//Fancy code goes here
		shadow.appendChild(template);
		setUpAttrPropertyLink(this, 'toggled', false, () => {}, booleaner);
	}
	static get observedAttributes() {
		return ['toggled'];
	}

}

export default ContainerSidebar;

Elements.load(ContainerSidebar, 'elements-container-sidebar');
