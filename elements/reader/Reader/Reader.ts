let current_url: string = '';

import type {GalleryScrollDynamic} from '../../gallery/scroll/dynamic/dynamic.js'
import type {ContainerDialog} from '../../container/dialog/dialog.js';
import type {CustomInputBar} from '../../custom/input/bar/bar.js';
import type {Grid} from '../../grid/grid.js';
import {Elements} from '../../elements_core.js';

export {};


const reader = document.querySelector('#main_scroller')! as GalleryScrollDynamic;
const page_count = document.querySelector('#page_count')! as HTMLInputElement;
const page_total = document.querySelector('#page_total')! as HTMLSpanElement;
const main_input = document.querySelector('#main_input') as CustomInputBar;
const dialog = document.querySelector('elements-container-dialog') as ContainerDialog;
const preview_template = document.querySelector('#reader-preview') as HTMLTemplateElement;


const respond = async (e: CustomEvent) => {
	main_input.value = '';
	const form = new FormData();
	form.append('url', e.detail);
	//@ts-ignore
	window.current_url = e.detail;
	current_url = e.detail;
	const response = await fetch('//127.0.0.1:5000', {
		method: 'POST',
		body: form,
	});
	const [urls, title] = await response.json();
	document.title = title;
	reader.img_urls = urls;
	dialog.hide();
	requestAnimationFrame(() => {
		page_count.value = '0';
		page_total.innerHTML = '/ ' + urls.length.toString();
	});
};

const redo = async () => {
	query_pics(current_url);
};

Elements.common.reader_reload = redo;


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
			case 'keyL':
			case 'Numpad6':
				reader.next();
				break;
			default:
				console.log(e.key);
		}
	});
	reader.addEventListener('positionChange', update_page as EventListener);
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

	reader.img_urls = links;
	document.title = gallery_name;
	requestAnimationFrame(() => {
		page_count.value = '0';
		page_total.innerHTML = '/ ' + links.length.toString();
	});
	dialog.hide();
	return false;
};

main();


Elements.loaded('reader-Reader');
