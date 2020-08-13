export const recommends = [];
export const requires = [];

import {Elements} from '../../../Elements.mjs';

const PRELOAD_GUESS = 1000;
const PRELOAD_HEIGHT = 3000;
const PRELOAD_EXCEED = 6;
const KEEP_BEHIND = 20;
/**
 * [GalleryScrollDynamic Description]
 * @augments Elements.elements.backbone3
 * @memberof Elements.elements
 */
class GalleryScrollDynamic extends Elements.elements.backbone3 {
	_body;
	_urls = [];
	_position = 0;
	_start = 0;
	_end = 0;
	_ticking = false;
	constructor() {
		super();

		this.name = 'GalleryScrollDynamic';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._body = template.querySelector('#pseudoBody');
		this._body.addEventListener('scroll', (e) => {
			if (!this._ticking) {
				this._ticking = true;
				requestIdleCallback(() => {
					this._scrollUpdate();
				});
			}
		})
		//Fancy code goes here
		shadow.appendChild(template);
		console.log('Test');
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
	set img_urls(urls) {
		if (!(urls instanceof Array)) {
			throw new Error('Did not get a list of urls');
			console.error('This is not a list of urls', urls);
			}
		this._urls = urls;

		this._rebuild_position(0);
	}
	get img_urls() {
		return this._urls;
	}
	_clear_imgs() {
		let children = [...this._body.children];
		requestAnimationFrame(() => {
			for (let img of children) {
				img.remove();
			}
		});
	}
	_create_img(src, callback) {
		const div = document.createElement('div');
		const img = document.createElement('img');
		img.className = 'scroll';
		img.src = src;
		if (callback === undefined) {
			callback = () => {
				this._img_load(img);
			}
		}
		img.addEventListener('load', callback);
		div.append(img);
		return div;
	}
	_scrollUpdate() {
		let i = 0;
		let height = 0;
		let below = 0;
		let above;
		const scrollTop = this._body.scrollTop;
		const scrollBottom = this._body.clientHeight + this._body.scrollTop;
		while (i < this._body.children.length && height < scrollTop) {
			let img = this._body.children[i];
			height += img.getBoundingClientRect().height;
			below += 1;
			i += 1;
		}
		if (height != scrollTop && i < this._body.children.length) {
			this._position = this._start + i - 1;
		} else {
			this._position = this._start + i;
		}
		while (i < this._body.children.length && height < scrollBottom) {
			let img = this._body.children[i];
			height += img.clientHeight;
			i += 1;
		}
		above = this._body.children.length - i;
		// console.log(below, this._body.children.length - below - above, above);
		if (below <= PRELOAD_EXCEED) {
			//TODO: Need to account for images loading
			let to_load = PRELOAD_EXCEED - below + 1;
			console.log('Would add ' + to_load.toString() + ' images below');
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
		} else if (below > KEEP_BEHIND) {
			let to_remove = below - KEEP_BEHIND;
			const imgs = [];
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
		if (above < PRELOAD_EXCEED) {
			let to_load = PRELOAD_EXCEED - above;
			console.log('Would add ' + to_load.toString() + ' images above');
			while (to_load > 0 && this._end < this._urls.length) {
				const img = this._create_img(this._urls[this._end]);
				requestAnimationFrame(() => {
					this._body.append(img);
				});
				this._end += 1;
				to_load -= 1
			}
		} else if (above > KEEP_BEHIND) {
			let to_remove = above - KEEP_BEHIND;
			const imgs = [];
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
		console.log(this._start, this._end);
	}
	set position(value) {
		if (!Number.isInteger(value)) {
			throw new Error('Cannot set position to a non integer');
		} else if (value < 0) {
			throw new Error('Invalid position ' + value.toString());
		} else if (value >= this._urls.length) {
			if (this._urls.length === 0 && value === 0) {
				requestAnimationFrame(() => {
					this._body.scrollIntoView();
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
		} else if (this._end < value) {
			this._rebuild_position(value);
		} else {
			const index = value - this._start;
			requestAnimationFrame(() => {
				this._body.scrollTop = this._body.children[index].offsetTop;
			});
			this._position = value;
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
		if (this._position > 1) {
			this.position -= 1;
		}
	}
	_img_load(img) {
	}
	_rebuild_position(position) {
		this._clear_imgs();
		let current = position - PRELOAD_EXCEED;
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
		{
			const img = this._create_img(this._urls[current], () => {
				requestAnimationFrame(() => {
					img.scrollIntoView();
				});
			});
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
			height += PRELOAD_GUESS;
		}



		while (height < PRELOAD_HEIGHT && current < this._urls.length) {
			const img = this._create_img(this._urls[current]);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			current += 1;
			height += PRELOAD_GUESS;
		}
		let i = 0;
		while (i < PRELOAD_EXCEED && current + i < this._urls.length) {
			const img = this._create_img(this._urls[current + i]);
			requestAnimationFrame(() => {
				this._body.append(img);
			});
			i += 1;
		}
		this._end = current + i;
		this._position = position;
		requestAnimationFrame(() => {
			this._body.children[position - this._start].scrollIntoView()
		});

	}
}

export {GalleryScrollDynamic};
export default GalleryScrollDynamic;

Elements.elements.GalleryScrollDynamic = GalleryScrollDynamic;

Elements.load(GalleryScrollDynamic, 'elements-gallery-scroll-dynamic');
