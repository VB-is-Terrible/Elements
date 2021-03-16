let current_url: string = '';

import type {GalleryScrollDynamic} from '../../gallery/scroll/dynamic/dynamic.js'
import type {ContainerDialog} from '../../container/dialog/dialog.js';
import type {CustomInputBar} from '../../custom/input/bar/bar.js';
import type {Grid} from '../../grid/grid.js';
import {Elements} from '../../elements_core.js';
import type { Toaster } from '../../toaster/toaster.js';
import { ToasterContext } from '../../toaster/Common/Common.js';

export {};
export const requires = ['toaster', 'elements-container-dialog',];

const reader = document.querySelector('#main_scroller')! as GalleryScrollDynamic;
const page_count = document.querySelector('#page_count')! as HTMLInputElement;
const page_total = document.querySelector('#page_total')! as HTMLSpanElement;
const main_input = document.querySelector('#main_input') as CustomInputBar;
const dialog = document.querySelector('elements-container-dialog') as ContainerDialog;
const preview_template = document.querySelector('#reader-preview') as HTMLTemplateElement;
const toaster = document.querySelector('#toaster') as Toaster;
const zoom_input = document.querySelector('#zoom_count') as HTMLInputElement;


const respond = async (e: CustomEvent) => {
	main_input.value = '';
	main_input.blur();
	query_pics(e.detail);
};

const redo = async () => {
	const current_page = reader.position;
	query_pics(current_url, current_page);
};

Elements.common.reader_reload = redo;
//@ts-ignore
window.redo = redo;


const query_pics = async (url: string, position?: number) => {
	const form = new FormData();
	form.append('url', url);
	//@ts-ignore
	window.current_url = url;
	current_url = url;
	const response = await fetch('//127.0.0.1:5000', {
		method: 'POST',
		body: form,
	});
	const [urls, title] = await response.json();
	set_urls(urls, title, position);
};

const update_page = (e: CustomEvent) => {
	requestAnimationFrame(() => {
		page_count.value = e.detail.toString();
	});
};

const page_update = (_e: Event) => {
	const page = parseInt(page_count.value);
	reader.position = page;
};

const LOCAL_FILES_BASE = '//127.0.0.1:5000/local_folders';
const load_local = async () => {
	const folders: {[key: number]: string} = await (await fetch(LOCAL_FILES_BASE)).json();
	fill_folders_link(folders);
};

const ZOOM_STEP = .1;
let zoom_factor = 1;
const main = () => {
	//@ts-ignore
	main_input.addEventListener('accept', respond);
	document.body.addEventListener('keypress', (e) => {
		switch (e.code) {
			case 'KeyA':
			case 'KeyJ':
			case 'Numpad4':
				reader.back();
				break;
			case 'KeyD':
			case 'KeyL':
			case 'Numpad6':
				reader.next();
				break;
			case 'KeyP':
				main_input.value = '';
				main_input.focus();
				e.preventDefault();
				break;
			default:
				console.log(e.key);
		}
	});
	reader.addEventListener('positionChange', update_page as EventListener);
	reader.addEventListener('gallery-load-fail', (e) => {image_fail(e as CustomEvent, reader.img_urls);});
	page_count.addEventListener('change', page_update);
	const local_button = document.querySelector('#local') as HTMLButtonElement;
	local_button.addEventListener('click', () => {
		dialog.toggle();
	});
	zoom_input.value = zoom_factor.toString();
	zoom_input.addEventListener('change', () => {
		zoom_factor = parseFloat(zoom_input.value);
		set_zoom_factor(zoom_factor);
	});
	const zoom_out = document.querySelector('#zoom_out') as HTMLButtonElement;
	const zoom_in = document.querySelector('#zoom_in') as HTMLButtonElement;
	zoom_out.addEventListener('click', () => {
		zoom_factor -= ZOOM_STEP;
		set_zoom_factor(zoom_factor);
	});
	zoom_in.addEventListener('click', () => {
		zoom_factor += ZOOM_STEP;
		set_zoom_factor(zoom_factor);
	});
	load_local();
	dialog.show();
};


const fill_folders_link = (folders: {[key: number]: string}) => {
	const columns = 5;
	const folder_grid = document.querySelector('#folder_grid')! as Grid;
	const rows = Math.ceil((Object.keys(folders).length) / columns);
	folder_grid.columns = columns;
	folder_grid.rows = rows;
	let children = [...folder_grid.children];
	requestAnimationFrame(() => {
		for (let img of children) {
			img.remove();
		}
	});

	const inverse = new Map<string, string>();
	const names = [];
	for (const url in folders) {
		const name = folders[url];
		names.push(name);
		inverse.set(name, url);
	}
	names.sort();

	let count = 1;
	for (const name of names) {
		const url = inverse.get(name);
		const fragment = document.importNode(preview_template, true).content;
		const p = fragment.querySelector('p.folder') as HTMLParagraphElement;
		const div = fragment.querySelector('div.folder') as HTMLDivElement;
		const img = fragment.querySelector('img.folder') as HTMLImageElement;
		const folder_url = LOCAL_FILES_BASE + '/' + url

		const event_listener = () => {
			p.className += ' visited';
			visit_local_link(folder_url, name);
		};
		img.addEventListener('click', event_listener);
		p.addEventListener('click', event_listener);
		p.innerHTML = name;
		div.slot = 's' + count.toString();
		img.src = folder_url + '/' + '0';
		requestAnimationFrame(() => {
			folder_grid.append(fragment);
		});
		count += 1;
	}
};

const visit_local_link = async (url: string, gallery_name: string) => {
	const pic_names: Array<string> = await (await fetch(url)).json();
	const links = []
	for (const pic of pic_names) {
		links.push(url + '/' + pic);
	}

	set_urls(links, gallery_name);
};

export const set_urls = (img_urls: Array<string>, title: string = 'MPV Reader', position?: number) => {
	reset_fails();
	requestAnimationFrame(() => {
		page_count.value = '0';
	});
	if (position !== undefined) {
		reader.set_and_jump(img_urls, position);
	} else {
		reader.img_urls = img_urls;
	}
	document.title = title;
	zoom_factor = 1;
	set_zoom_factor(zoom_factor);
	requestAnimationFrame(() => {
		page_count.max = (img_urls.length - 1).toString();
		page_total.innerHTML = '/ ' + img_urls.length.toString();
	});
	dialog.hide();
}

let seen_fails: number[] = [];
let fails: number[] = [];
let fails_total = new Set();
const notify_fail_toast = new ToasterContext(toaster);
const redo_toast = new ToasterContext(toaster);
const CHECK_BEHIND = 20;
const ACCEPTED_FAILS = 2;
const EXCLUSION_ZONE = 15;
const FAIL_NOTIFICATION_TIMEOUT = 7000;


const reset_fails = () => {
	seen_fails = [];
	fails = [];
	fails_total = new Set();
	toaster.clearToasts();
};


const add_fail = (fail: number) => {
	for (const seen_fail of seen_fails) {
		if (Math.abs(seen_fail - fail) < EXCLUSION_ZONE) {
			return;
		}
	}
	fails.push(fail);
	fails.sort();
};


const notify_fail = (fail: number) => {
	if (fails_total.has(fail)) {
		return;
	}
	fails_total.add(fail);
	const fail_line = `${fails_total.size} images have failed to load`;
	notify_fail_toast.addToast({
		title: 'Failed image loads',
		body: fail_line,
		timeout: FAIL_NOTIFICATION_TIMEOUT,
	});
};


const on_excess_fail = (fail :number) => {
	let i = 0;
	while (i < fails.length) {
		if (Math.abs(fail - fails[i]) < EXCLUSION_ZONE) {
			fails.shift();
		} else {
			i++;
		}
	}
	seen_fails.push(fail);
};


const image_fail = (e: CustomEvent, urls: Array<string>) => {
	console.warn(`Failed load for ${e.detail}`);
	const index = urls.indexOf(e.detail);
	add_fail(index);
	notify_fail(index);
	const fail = check_fails();
	if (fail !== -1) {
		on_excess_fail(fail);
		const new_toast = redo_toast.addToast({
			title: 'Excessive image load fails',
			buttons: ['Reload images'],
		});
		if (new_toast) {
			redo_toast.toast!.addEventListener('toast_button_click', () => {
				redo();
			});
		}
	}
};

const check_fails = () => {
	let i = 0;
	const tracked_fails = [];
	while (i < fails.length) {
		const current_fail = fails[i];
		tracked_fails.push(current_fail);
		while (tracked_fails[0] < current_fail - CHECK_BEHIND) {
			tracked_fails.shift();
		}
		if (tracked_fails.length > ACCEPTED_FAILS) {
			return fails[i];
		}
		i++;
	}
	return -1;
};



const zoom_factor_stylesheet = document.createElement('style');
document.body.append(zoom_factor_stylesheet);
const set_zoom_factor = (zoom: number) => {
	const sheet = zoom_factor_stylesheet.sheet;
	const rule = `elements-gallery-scroll-dynamic::part(image-container) {
		max-height: ${zoom * 100}%;
	}`;
	requestAnimationFrame(() => {
		zoom_input.value = zoom.toString();
		if (sheet !== null) {
			if (sheet.cssRules.length === 1) {
				sheet.deleteRule(0);
			}
			sheet.insertRule(rule);
		}
	})
};


export default main;


Elements.loaded('reader-Reader');
