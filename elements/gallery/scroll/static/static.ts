const recommends: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {GalleryScroll, template_promise} from '../scroll.js';
import {removeChildren, wait} from '../../../elements_helper.js';

Elements.get(...recommends);

const class_version = 27666431;
const LOAD_LEWAY = 3000;
const DELAY = false;

interface img_info {
	position: number;
	size: number;
}

const read_border_box = (entry: ResizeObserverEntry): ResizeObserverSize => {
	if (entry.borderBoxSize) {
		// Firefox compat
		// @ts-ignore
		if (entry.borderBoxSize.blockSize) {
			// @ts-ignore Firefox path
			return entry.borderBoxSize;
		} else {
			// @ts-ignore Chrome path
			return entry.borderBoxSize[0];
		}
	} else {
		// @ts-ignore
		return entry.contentRect;
	}
};


/**
 * [GalleryScrollStatic Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class GalleryScrollStatic extends GalleryScroll {
	private _ticking = false;
	private _ro: ResizeObserver;
	private _img_map = new WeakMap<Element, img_info>();
	private _pos_size = new Map<number, number>();
	private _portion: number = 0;
	private _last_rebuild = 0;
	constructor() {
		super();

		this._body.addEventListener('scroll', (_e) => {
			if (!this._ticking) {
				this._ticking = true;
				//@ts-ignore
				requestIdleCallback(() => {
					this._scrollUpdate();
					this._ticking = false;
				});
			}
		});
		this._ro = new ResizeObserver((resizeList: ResizeObserverEntry[], observer: ResizeObserver) => {
			this._resize(resizeList, observer)
		});

		if (class_version === this.__final_version) {
			this.post_init();
		}
	}
	static get observedAttributes() {
		return [];
	}
	protected get __final_version() {
		return class_version;
	}
	protected _rebuild_position(position: number) {
		const old = this._position;

		this._fill_imgs();

		requestAnimationFrame(() => {
			this._body.children[position].scrollIntoView();
		});
		if (old != this._position) {
			const event = new CustomEvent(
				'positionChange',
				{detail: this._position}
			);
			this.dispatchEvent(event);
		}
	}
	private _fill_imgs() {
		removeChildren(this._body);
		for (let i = 0; i < this._urls.length; i++) {
			const url = this._urls[i];
			const img = this._create_img(url);
			this._img_map.set(img, {position: i, size: 0});
			this._pos_size.set(i, 0);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
		}
	}
	get position() {
		return this._position;
	}
	set position(value: number) {
		const old = this._position;
		if (!Number.isInteger(value)) {
			throw new Error('Cannot set position to a non integer');
		} else if (value < 0) {
			throw new Error('Invalid position ' + value.toString());
		} else if (value >= this._urls.length) {
			if (this._urls.length === 0 && value === 0) {
				requestAnimationFrame(() => {
					this._body.scrollIntoView();
					this._body.scrollTop = 0;
				});
				this._position = 0;
				return;
			}
			throw new Error('Invalid position ' + value.toString());
		}
		requestAnimationFrame(() => {
			this._body.children[value].scrollIntoView();
		});
		this._position = value;
		this._portion = 0;
		this.setAttribute('position', value.toString());
		if (old != this._position) {
			const event = new CustomEvent(
				'positionChange',
				{detail: this._position}
			);
			this.dispatchEvent(event);
		}

	}
	pop() {
		const first = this._body.children[0] as HTMLDivElement;
		const size = first.getBoundingClientRect().height;
		requestAnimationFrame(() => {
			const scrollTop = this._body.scrollTop;
			first.remove();
			this._body.scroll(0, scrollTop - size);
		});
	}
	private _scrollUpdate() {
		if (Date.now() - LOAD_LEWAY < this._last_rebuild) {
			return;
		}
		const scrollTop = this._body.scrollTop;
		let i = 0;
		let height = 0;
		let diff = 0;
		let elem_height = -1;
		while (i < this._body.children.length && height < scrollTop) {
			elem_height = this._pos_size.get(i)!;
			diff = scrollTop - height;
			height += elem_height;
			i += 1;
		}


		if (Math.abs(height - scrollTop) > .99 && i < this._body.children.length) {
			this._portion = diff / elem_height;
			this._position = i - 1;
		} else if (i === this._body.children.length) {
			this._portion = 0;
			if (this.img_urls.length === 0) {
				return 0;
			} else {
				this._position = i - 1;
			}
		} else {
			this._portion = 0;
			this._position = i;
		}
		this.setAttribute('position', this._position.toString());
		return this._position;
	}
	_create_img(src: string, callback: (() => void) | null = null) {
		const img = super._create_img(src, callback, DELAY);
		this._img_map.set(img, {position: -1, size: -1});
		this._ro.observe(img);
		return img;
	}
	_resize(resizeList: ResizeObserverEntry[], _observer: ResizeObserver) {
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
		}
		let newTop = 0;
		for (let i = 0; i < this._position; i++) {
			newTop += this._pos_size.get(i)!;
		}
		newTop += this._pos_size.get(this._position)! * this._portion;
		if (Date.now() - LOAD_LEWAY < this._last_rebuild) {
			return;
		}
		this._body.scroll(0, newTop);
	}
	set img_urls(urls: Array<string>) {
		if (!(urls instanceof Array)) {
			console.error('This is not a list of urls', urls);
			throw new Error('Did not get a list of urls');
		}
		this._urls = urls;

		this._img_map = new WeakMap();
		this._pos_size.clear();
		this._last_rebuild = Date.now();
		setTimeout(() => {
			this._scrollUpdate();
		}, LOAD_LEWAY);


		this._rebuild_position(0);
	}
	get img_urls() {
		return this._urls;
	}
}

export default GalleryScrollStatic;

Elements.elements.GalleryScrollStatic = GalleryScrollStatic;

Elements.load(GalleryScrollStatic, 'elements-gallery-scroll-static', false, template_promise);
