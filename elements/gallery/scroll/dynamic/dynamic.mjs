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
	constructor() {
		super();

		this.name = 'GalleryScrollDynamic';
		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(this.name);

		this._body = template.querySelector('#pseudoBody');
		this._body.addEventListener('scroll', (e) => {
			this._scrollUpdate();
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
		this._clear_imgs();
		this._urls = urls;

		let height = 0;
		let i = 0;
		while (height < PRELOAD_HEIGHT) {
			const img = this.constructor._create_img(urls[i]);
			requestAnimationFrame(() => {
				this._body.append(img);
				console.log(1);
			});
			i++;
			height += PRELOAD_GUESS;
		}
		for (let j = 0; j < PRELOAD_EXCEED; j++) {
			const img = this.constructor._create_img(urls[i + j]);
			requestAnimationFrame(() => {
				this._body.append(img);
				console.log(2);
			});
		}
		this._position = 0;
		this._start = 0;
		this._end = i + PRELOAD_EXCEED;
		this._body.children[0].scrollIntoView();
	}
	get img_urls() {
		return this._urls;
	}
	_clear_imgs() {
		requestAnimationFrame(() => {
			let children = [...this._body.children];
			for (let img of children) {
				img.remove();
				console.log(3);
			}
		});
	}
	static _create_img(src) {
		const div = document.createElement('div');
		const img = document.createElement('img');
		img.className = 'scroll';
		img.src = src;
		div.append(img);
		return div;
	}
	_scrollUpdate() {

		const diff = this._body.scrollHeight - this._body.clientHeight  - this._body.scrollTop
		let to_load = PRELOAD_EXCEED + 1;
		let height = 0;
		let i = this._body.children.length - 1;
		while (i >= 0 && to_load > 0 && height <= diff) {
			let img = this._body.children[i];
			height += img.clientHeight;
			to_load -= 1;
			i -= 1;
		}
		console.log('Would add ' + to_load.toString() + ' images');
		while (to_load > 0 && this._end < this._urls.length) {
			const img = this.constructor._create_img(this._urls[this._end]);
			requestAnimationFrame(() => {
				this._body.append(img);
				console.log(4);
			});
			this._end += 1;
			to_load -= 1
		}
	}
	set position(value) {
		if (!Number.isInteger(value)) {
			throw new Error('Cannot set position to a non integer');
		} else if (value < 0) {
			throw new Error('Invalid position ' + value.toString());
		} else if (value >= this._urls.length) {
			if (this._urls.length == 0 && value == 0) {
				this._body.scrollIntoView();
				this._position = 0;
				return;
			}
			throw new Error('Invalid position ' + value.toString());
		}
		//TODO: May reqiure repopulating the gallery
		this._body.children[value].scrollIntoView();
		this._position = value;
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
}

export {GalleryScrollDynamic};
export default GalleryScrollDynamic;

Elements.elements.GalleryScrollDynamic = GalleryScrollDynamic;

Elements.load(GalleryScrollDynamic, 'elements-gallery-scroll-dynamic');
