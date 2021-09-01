const recommends: Array<string> = [];
const requires: Array<string> = [];

// TODO: Make this coreless
import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {applyPriorProperties} from '../../elements_helper.js';

Elements.get(...recommends);
await Elements.get(...requires);

export const template_promise = Elements.loadTemplate('gallery/scroll/scrollTemplate.html');
const video_formats = new Set(['.mp4', '.webm', '.ogv', '.avi']);


const class_version = -55283902;
const ELEMENT_NAME = 'GalleryScroll';
/**
 * [GalleryScroll Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export abstract class GalleryScroll extends backbone4 {
	_body: HTMLElement;
	_urls: Array<string> = [];
	_position = 0;
	abstract position: number;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		this._body = template.querySelector('#pseudoBody')! as HTMLDivElement;
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return [];
	}
	protected post_init() {
		applyPriorProperties(this, 'img_urls', 'position');
	}
	protected get __final_version() {
		return class_version;
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
	protected _create_img(src: string, callback: (() => void) | null = null) {
		const div = document.createElement('div');
		let img: HTMLImageElement | HTMLVideoElement;
		let video = false;
		const under_string = src.toLowerCase();
		for (const extension of video_formats) {
			if (under_string.endsWith(extension)) {
				video = true;
				break;
			}
		}
		if (!video) {
			img = document.createElement('img');
		} else {
			img = document.createElement('video');
			img.autoplay = true;
			img.muted = true;
		}
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
	protected _img_load(_img: HTMLImageElement | HTMLVideoElement) {
	}
	protected abstract _rebuild_position(position: number): void;
	set_and_jump(img_urls: Array<string>, position: number = 0) {
		if (!(img_urls instanceof Array)) {
			console.error('This is not a list of urls', img_urls);
			throw new Error('Did not get a list of urls');
			}
		this._urls = img_urls;
		this._rebuild_position(position)
	}
}

export default GalleryScroll;

Elements.classes.GalleryScroll = GalleryScroll;

Elements.loaded('gallery-scroll');
