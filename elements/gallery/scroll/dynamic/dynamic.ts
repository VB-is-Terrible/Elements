export const recommends = [];
export const requires = [];

import {Elements} from '../../../elements_core.js';
import {backbone4} from '../../../elements_backbone.js';
import { rafContext, removeChildren } from '../../../elements_helper.js';


const ELEMENT_NAME = 'GalleryScrollDynamic';





const PRELOAD_GUESS = 1000;
const PRELOAD_HEIGHT = 3000;
const PRELOAD_EXCEED = 9;
const KEEP_BEHIND = 20;

/**
 * @event GalleryScrollDynamic#gallery-load-fail
 * @property {String} detail URL that failed to load
 */
/**
 * @event GalleryScrollDynamic#position_changed
 * @property {number} detail The new position
 */
/**
 * A image scroller with dynamic insertion/removal
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 * @property {Number} position The index of the currently viewed image
 * @property {Array<String>} img_urls The list of urls of images to display
 * @property {Number} PRELOAD_GUESS The guess for the height of one image
 * @property {Number} PRELOAD_HEIGHT The guess for the of the current image + any viewable images
 * @property {Number} PRELOAD_EXCEED The number of images that should be preloaded
 * @property {Number} KEEP_BEHIND The number of images behind the current that should be kept in the DOM
 * @fires GalleryScrollDynamic#gallery-load-fail
 * @fires GalleryScrollDynamic#position_changed
 */
export class GalleryScrollDynamic extends backbone4 {
	_body: HTMLElement;
	_urls: Array<string> = [];
	_position = 0;
	_start = 0;
	_end = 0;
	_ticking = false;
	_final_scroll: ReturnType<typeof rafContext>;
	PRELOAD_GUESS = PRELOAD_GUESS;
	PRELOAD_HEIGHT = PRELOAD_HEIGHT;
	PRELOAD_EXCEED = PRELOAD_EXCEED;
	KEEP_BEHIND = KEEP_BEHIND;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		this._body = template.querySelector('#pseudoBody')! as HTMLDivElement;
		this._body.addEventListener('scroll', (_e) => {
			if (!this._ticking) {
				this._ticking = true;
				//@ts-ignore
				requestIdleCallback(() => {
					this._scrollUpdate();
				});
			}
		})
		this._final_scroll = rafContext();
		//Fancy code goes here
		shadow.appendChild(template);
	}
	connectedCallback() {
		super.connectedCallback();
	}
	disconnectedCallback() {
		super.disconnectedCallback();
	}
	static get observedAttributes() {
		return [];
	}
	set img_urls(urls: Array<string>) {
		if (!(urls instanceof Array)) {
			console.error('This is not a list of urls', urls);
			throw new Error('Did not get a list of urls');
			}
		this._urls = urls;

		this._rebuild_position(0);
	}
	get img_urls() {
		return this._urls;
	}
	private _create_img(src: string, callback: (() => void) | null = null) {
		const div = document.createElement('div');
		const img = document.createElement('img');
		div.className = 'scroll';
		//@ts-ignore
		div.part = 'image-container';
		img.className = 'scroll';
		img.src = src;
		if (callback === null) {
			callback = () => {
				this._img_load(img);
			}
		}
		img.addEventListener('load', callback);
		img.addEventListener('error', () => {
			const ev = new CustomEvent('gallery-load-fail', {
				detail: src,
			});
			this.dispatchEvent(ev);
		});
		div.append(img);
		return div;
	}
	private _scrollUpdate() {
		let i = 0;
		let height = 0;
		let below = 0;
		let above;
		const old = this._position;
		const scrollTop = this._body.scrollTop;
		const scrollBottom = this._body.clientHeight + this._body.scrollTop;
		while (i < this._body.children.length && height < scrollTop) {
			let img = this._body.children[i];
			height += img.getBoundingClientRect().height;
			below += 1;
			i += 1;
		}
		if (Math.abs(height - scrollTop) > .99 && i < this._body.children.length) {
			this._position = this._start + i - 1;
		} else if (i === this._body.children.length) {
			if (this.img_urls.length === 0) {
				this._position = 0;
			} else {
				this._position = this._start + i - 1;
			}
		} else {
			this._position = this._start + i;
		}
		while (i < this._body.children.length && height < scrollBottom) {
			let img = this._body.children[i];
			height += img.clientHeight;
			i += 1;
		}
		above = this._body.children.length - i;
		if (below <= this.PRELOAD_EXCEED) {
			//TODO: Need to account for images loading
			let to_load = this.PRELOAD_EXCEED - below + 1;
			let first = this._body.children[0];
			while (to_load > 0 && this._start > 0) {
				const img = this._create_img(this._urls[this._start - 1]);
				requestAnimationFrame(() => {
					this._body.insertBefore(img, first);
					first = img;
				});
				this._start -= 1;
				to_load -= 1
			}
		} else if (below > this.KEEP_BEHIND) {
			let to_remove = below - this.KEEP_BEHIND;
			const imgs: Element[] = [];
			for (let i = 0; i < to_remove; i++) {
				imgs.push(this._body.children[i]);
			}
			this._start += to_remove;
			requestAnimationFrame(() => {
				for (const img of imgs) {
					img.remove();
				}
			});
		}
		if (above < this.PRELOAD_EXCEED) {
			let to_load = this.PRELOAD_EXCEED - above;
			while (to_load > 0 && this._end < this._urls.length) {
				const img = this._create_img(this._urls[this._end]);
				requestAnimationFrame(() => {
					this._body.append(img);
				});
				this._end += 1;
				to_load -= 1
			}
		} else if (above > this.KEEP_BEHIND) {
			let to_remove = above - this.KEEP_BEHIND;
			const imgs: Element[] = [];
			for (let i = 0; i < to_remove; i++) {
				imgs.push(this._body.children[this._body.children.length - i - 1]);
			}
			this._end -= to_remove;
			requestAnimationFrame(() => {
				for (const img of imgs) {
					img.remove();
				}
			});
		}
		requestAnimationFrame(() => {
			this._ticking = false;
		});
		if (old != this._position) {
			const event = new CustomEvent(
				'positionChange',
				{detail: this._position}
			);
			this.dispatchEvent(event);
		}
	}
	set position(value) {
		const old = this._position;
		if (!Number.isInteger(value)) {
			throw new Error('Cannot set position to a non integer');
		} else if (value < 0) {
			throw new Error('Invalid position ' + value.toString());
		} else if (value >= this._urls.length) {
			if (this._urls.length === 0 && value === 0) {
				this._final_scroll(() => {
					this._body.scrollIntoView();
					this._body.scrollTop = 0;
				});
				this._position = 0;
				return;
			}
			throw new Error('Invalid position ' + value.toString());
		}
		//TODO: May reqiure repopulating the gallery
		//TODO: Set scrollTop instead
		if (this._start > value) {
			this._rebuild_position(value);
		} else if (this._end <= value) {
			this._rebuild_position(value);
		} else {
			const index = value - this._start;
			this._final_scroll(() => {
				this._body.scrollTop = (
					(this._body.children[index] as HTMLElement).offsetTop -
					this._body.offsetTop);
			});
			this._position = value;
		}
		if (old != this._position) {
			const event = new CustomEvent(
				'positionChange',
				{detail: this._position}
			);
			this.dispatchEvent(event);
		}

	}
	get position() {
		return this._position;
	}
	next() {
		if (this._position < this._urls.length - 1) {
			this.position += 1;
		}
	}
	back() {
		if (this._position > 0) {
			this.position -= 1;
		}
	}
	private _img_load(_img: HTMLImageElement) {
	}
	private _rebuild_position(position: number) {
		const old = this._position;
		removeChildren(this._body);
		let current = position - this.PRELOAD_EXCEED;
		if (current < 0) {
			current = 0;
		}
		this._start = current;
		while (current < position && current < this._urls.length) {
			const img = this._create_img(this._urls[current]);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
		}
		let height = 0;
		if (current < this._urls.length) {
			const img = this._create_img(this._urls[current], () => {
				this._final_scroll(() => {
					img.scrollIntoView();
				});
			});
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
			height += this.PRELOAD_GUESS;
		}



		while (height < this.PRELOAD_HEIGHT && current < this._urls.length) {
			const img = this._create_img(this._urls[current]);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
			height += this.PRELOAD_GUESS;
		}
		let i = 0;
		while (i < this.PRELOAD_EXCEED && current + i < this._urls.length) {
			const img = this._create_img(this._urls[current + i]);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			i += 1;
		}
		this._end = current + i;
		this._position = position;
		if (this._end - this._start) {
			this._final_scroll(() => {
				this._body.children[position - this._start].scrollIntoView()
			});
		}
		if (old != this._position) {
			const event = new CustomEvent(
				'positionChange',
				{detail: this._position}
			);
			this.dispatchEvent(event);
		}

	}
	set_and_jump(img_urls: Array<string>, position: number = 0) {
		if (!(img_urls instanceof Array)) {
			console.error('This is not a list of urls', img_urls);
			throw new Error('Did not get a list of urls');
			}
		this._urls = img_urls;
		this._rebuild_position(position)
	}
}

export default GalleryScrollDynamic;

Elements.elements.GalleryScrollDynamic = GalleryScrollDynamic;

Elements.load(GalleryScrollDynamic, 'elements-gallery-scroll-dynamic');
