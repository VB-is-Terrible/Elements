let current_url: string = '';

import type {GalleryScrollDynamic} from '../../gallery/scroll/dynamic/dynamic.js'
import type {ContainerDialog} from '../../container/dialog/dialog.js';
import type {CustomInputBar} from '../../custom/input/bar/bar.js';
import type {Grid} from '../../grid/grid.js';
import {Elements} from '../../elements_core.js';
import { Toaster } from '../../toaster/toaster.js';

export {};


const reader = document.querySelector('#main_scroller')! as GalleryScrollDynamic;
const page_count = document.querySelector('#page_count')! as HTMLInputElement;
const page_total = document.querySelector('#page_total')! as HTMLSpanElement;
const main_input = document.querySelector('#main_input') as CustomInputBar;
const dialog = document.querySelector('elements-container-dialog') as ContainerDialog;
const preview_template = document.querySelector('#reader-preview') as HTMLTemplateElement;
const toaster = document.querySelector('#toaster') as Toaster;


const respond = async (e: CustomEvent) => {
	main_input.value = '';
	query_pics(e.detail);
};

const redo = async () => {
	const current_page = reader.position;
	await query_pics(current_url);
	requestAnimationFrame(() => {
		reader.position = current_page;
	});
};

Elements.common.reader_reload = redo;
//@ts-ignore
window.redo = redo;


const query_pics = async (url: string) => {
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
	document.title = title;
	reset_fails();
	reader.img_urls = urls;
	dialog.hide();
	requestAnimationFrame(() => {
		page_count.value = '0';
		page_total.innerHTML = '/ ' + urls.length.toString();
	});
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
	const remote_button = document.querySelector('#remote') as HTMLButtonElement;
	local_button.addEventListener('click', () => {
		dialog.show();
	});
	remote_button.addEventListener('click', () => {
		dialog.hide();
	});
	load_local();
}


const fill_folders_link = (folders: {[key: number]: string}) => {
	// debugger;
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
	reader;

	reset_fails();
	reader.img_urls = links;
	document.title = gallery_name;
	requestAnimationFrame(() => {
		page_count.value = '0';
		page_total.innerHTML = '/ ' + links.length.toString();
	});
	dialog.hide();
	return false;
};

let seen_fails: number[] = [];
let fails: number[] = [];
const CHECK_BEHIND = 20;
const ACCEPTED_FAILS = 2;
const EXCLUSION_ZONE = 15;


const reset_fails = () => {
	seen_fails = [];
	fails = [];
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
	const index = urls.indexOf(e.detail);
	add_fail(index);
	const fail = check_fails();
	if (fail !== -1) {
		on_excess_fail(fail);
		const toast = toaster.addToast({
			title: 'Excessive image load fails',
			buttons: ['Reload images'],
		});
		toast.addEventListener('toast_button_click', () => {
			redo();
		});
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
}
main();


Elements.loaded('reader-Reader');
