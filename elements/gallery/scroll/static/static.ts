const recommends: Array<string> = [];

import {Elements} from '../../../elements_core.js';
import {GalleryScroll, template_promise} from '../scroll.js';
import {removeChildren} from '../../../elements_helper.js';

Elements.get(...recommends);

const class_version = 27666431;
/**
 * [GalleryScrollStatic Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class GalleryScrollStatic extends GalleryScroll {
	constructor() {
		super();
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
		for (const url of this._urls) {
			const img = this._create_img(url);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
		}
	}
	get position() {
		const scrollTop = this._body.scrollTop;
		let i = 0;
		let height = 0;
		while (i < this._body.children.length && height < scrollTop) {
			let img = this._body.children[i];
			height += img.getBoundingClientRect().height;
			i += 1;
		}
		if (Math.abs(height - scrollTop) > .99 && i < this._body.children.length) {
			this._position = i - 1;
		} else if (i === this._body.children.length) {
			if (this.img_urls.length === 0) {
				return 0;
			} else {
				this._position = i - 1;
			}
		} else {
			this._position = i;
		}
		return this._position;
	}
	set position(value) {
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
}

export default GalleryScrollStatic;

Elements.elements.GalleryScrollStatic = GalleryScrollStatic;

Elements.load(GalleryScrollStatic, 'elements-gallery-scroll-static', false, template_promise);
