const recommends: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {GalleryScroll, template_promise, read_border_box} from '../scroll.js';
import { rafContext, removeChildren } from '../../../elements_helper.js';

Elements.get(...recommends);

const class_version = 4725153;

const PRELOAD_GUESS = 1000;
const PRELOAD_HEIGHT = 3000;
const PRELOAD_EXCEED = 9;
const KEEP_BEHIND = 20;

console.assert(PRELOAD_EXCEED < KEEP_BEHIND);

const LOAD_LEWAY = 3000;
const DELAY = false;
const STATIONARY_WAIT = 1000;

interface img_info {
	position: number;
	size: number;
}

//@ts-ignore
const ricContext = (): (f: (timestamp: IdleDeadline) => void) => void => {
        let raf: number | null = null;
        return (f) => {
                if (raf !== null) {
			//@ts-ignore
                        cancelIdleCallback(raf);
                }
		//@ts-ignore
                raf = requestIdleCallback((e) => {
                        f(e);
                        raf = null;
                });
        };
};


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
export class GalleryScrollDynamic extends GalleryScroll {
	private _start = 0;
	private _end = 0;
	private _final_scroll: ReturnType<typeof rafContext>;
	private _ro: ResizeObserver;
	private _img_map = new WeakMap<Element, img_info>();
	private _pos_size = new Map<number, number>();
	private _portion: number = 0;
	private _last_rebuild = Date.now();
	private _scroll_update_context = ricContext();
	private _check_preload_context = ricContext();
	private _wait_stationary = ricContext();
	private _above = 0;
	private _below = 0;
	private _to_remove: Array<Element> | null = null;
	private _last_movement = 0;
	private _remove_behind: () => void;
	PRELOAD_GUESS = PRELOAD_GUESS;
	PRELOAD_HEIGHT = PRELOAD_HEIGHT;
	PRELOAD_EXCEED = PRELOAD_EXCEED;
	KEEP_BEHIND = KEEP_BEHIND;
	constructor() {
		super();

		this._body.addEventListener('scroll', (_e) => {
			this._scroll_update_context(() => {
				this._scrollUpdate();
			});
			this._last_movement = Date.now();
		});

		this._ro = new ResizeObserver((resizeList: ResizeObserverEntry[], observer: ResizeObserver) => {
			this._resize(resizeList, observer)
		});

		this._final_scroll = rafContext();

		this._remove_behind = () => {
			if (Date.now() - STATIONARY_WAIT > this._last_movement) {
				requestAnimationFrame(() => {
					if (this._to_remove === null) {return;}
					this._start += this._to_remove.length;
					for (const img of this._to_remove) {
						img.remove();
					}
					this._to_remove = null;
				});
			} else {
				this._wait_stationary(this._remove_behind);
			}
		}
		if (class_version === this.__final_version){
			this.post_init();
		}
	}
	static get observedAttributes() {
		return [];
	}
	protected get __final_version() {
		return class_version;
	}
	private _scrollUpdate() {
		if (Date.now() - LOAD_LEWAY < this._last_rebuild) {
			return;
		}

		let i = 0;
		let height = 0;
		const old = this._position;
		const scrollTop = this._body.scrollTop;
		const scrollBottom = this._body.clientHeight + this._body.scrollTop;

		let diff = 0;
		let elem_height = -1;

		while (i < this._body.children.length && height < scrollTop) {
			elem_height = this._pos_size.get(i + this._start)!;
			diff = scrollTop - height;
			height += elem_height;
			i += 1;
		}

		this._below = i;

		if (Math.abs(height - scrollTop) > .99 && i < this._body.children.length) {
			this._portion = diff / elem_height;
			this._position = this._start + i - 1;
		} else if (i === this._body.children.length) {
			this._portion = 0;
			if (this.img_urls.length === 0) {
				this._position = 0;
			} else {
				this._position = this._start + i - 1;
			}
		} else {
			this._portion = 0;
			this._position = this._start + i;
		}
		while (i < this._body.children.length && height < scrollBottom) {
			let img = this._body.children[i];
			height += img.clientHeight;
			i += 1;
		}
		this._above = this._body.children.length - i;

		// Start adding/removing images

		this._check_preload_context(() => {
			this._check_preload();
		});
		// End adding/removing images

		if (old != this._position) {
			const event = new CustomEvent(
				'positionChange',
				{detail: this._position}
			);
			this.dispatchEvent(event);
		}
	}
	private _check_preload() {
		const below = this._below;
		const above = this._above;
		if (below <= this.PRELOAD_EXCEED) {
			let to_load = this.PRELOAD_EXCEED - below + 1;
			let first = this._body.children[0];
			while (to_load > 0 && this._start > 0) {
				const img = this._create_img(this._start - 1);
				requestAnimationFrame(() => {
					this._body.insertBefore(img, first);
					first = img;
				});
				this._start -= 1;
				to_load -= 1;
			}
		} else if (below > this.KEEP_BEHIND) {
			let to_remove = below - this.KEEP_BEHIND;
			const imgs: Element[] = [];
			for (let i = 0; i < to_remove; i++) {
				imgs.push(this._body.children[i]);
			}
			this._to_remove = imgs;
			this._wait_stationary(this._remove_behind);
		}
		if (above < this.PRELOAD_EXCEED) {
			let to_load = this.PRELOAD_EXCEED - above;
			while (to_load > 0 && this._end < this._urls.length) {
				const img = this._create_img(this._end);
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
			requestAnimationFrame(() => {
				this._end -= to_remove;
				for (const img of imgs) {
					img.remove();
				}
			});
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
			this._portion = 0;
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
	protected _rebuild_position(position: number) {
		const old = this._position;

		this._ro.disconnect();
		removeChildren(this._body);
		this._img_map = new WeakMap();
		this._pos_size.clear();

		let current = position - this.PRELOAD_EXCEED;
		if (current < 0) {
			current = 0;
		}
		this._start = current;
		while (current < position && current < this._urls.length) {
			const img = this._create_img(current);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
		}
		let height = 0;
		if (current < this._urls.length) {
			const img = this._create_img(current, () => {
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
			const img = this._create_img(current);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
			height += this.PRELOAD_GUESS;
		}
		let i = 0;
		while (i < this.PRELOAD_EXCEED && current + i < this._urls.length) {
			const img = this._create_img(current + i);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			i += 1;
		}
		this._end = current + i;
		this._position = position;
		if (this._end - this._start) {
			this._final_scroll(() => {
				this._body.scrollTop = (
					(this._body.children[position - this._start] as HTMLElement).offsetTop -
					this._body.offsetTop);

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
	protected _create_img(position: number, callback: (() => void) | null = null) {
		const img = super._create_img(position, callback, DELAY);
		this._img_map.set(img, {position: position, size: 0});
		this._pos_size.set(position, 0);
		this._ro.observe(img);
		return img;
	}
	private _resize(resizeList: ResizeObserverEntry[], _observer: ResizeObserver) {
		let below = false;
		for (const entry of resizeList) {
			if (!this._img_map.has(entry.target)) {
				console.error('img_map is missing entry');
				throw new Error('img_map is missing entry');
			}
			const old = this._img_map.get(entry.target)!;
			const current_size = read_border_box(entry).blockSize;
			old.size = current_size;
			this._img_map.set(entry.target, old);
			this._pos_size.set(old.position, current_size);
			if (old.position <= this._position) {
				below = true;
			}
		}
		if (below) {
			this._fix_resize();
		}
	}
	private _fix_resize() {
		let newTop = 0;
		for (let i = this._start; i < this._position; i++) {
			newTop += this._pos_size.get(i)!;
		}
		newTop += this._pos_size.get(this._position)! * this._portion;
		if (Date.now() - LOAD_LEWAY < this._last_rebuild) {
			return;
		}
		this._body.scroll(0, newTop);
	}
}

export default GalleryScrollDynamic;

Elements.load(GalleryScrollDynamic, 'elements-gallery-scroll-dynamic', false, template_promise);
