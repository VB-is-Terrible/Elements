const requires = ['toaster', 'container-dialog', 'grid', 'gallery-scroll-dynamic'];
const recommends = ['custom-input-bar'];
let current_url: string = '';

import type {GalleryScrollDynamic} from '../elements/gallery/scroll/dynamic/dynamic.js'
import type {ContainerDialog} from '../elements/container/dialog/dialog.js';
import type {CustomInputBar} from '../elements/custom/input/bar/bar.js';
import type {Grid} from '../elements/grid/grid.js';
import {Elements} from '../elements/elements_core.js';
import type { Toaster } from '../elements/toaster/toaster.js';
import { ToasterContext } from '../elements/toaster/Common/Common.js';
import type {ToastData} from '../elements/toaster/toast/toast.js';

Elements.get(...recommends);
await Elements.get(...requires);

const reader = document.querySelector('#main_scroller')! as GalleryScrollDynamic;
const page_count = document.querySelector('#page_count')! as HTMLInputElement;
const page_total = document.querySelector('#page_total')! as HTMLSpanElement;
const main_input = document.querySelector('#main_input') as CustomInputBar;
const dialog = document.querySelector('elements-container-dialog') as ContainerDialog;
const preview_template = document.querySelector('#reader-preview') as HTMLTemplateElement;
const toaster = document.querySelector('#toaster') as Toaster;
const zoom_input = document.querySelector('#zoom_count') as HTMLInputElement;


const load_toast = new ToasterContext(toaster);
const respond = async (e: CustomEvent) => {
	main_input.value = '';
	main_input.blur();
	load_toast.addToast({
		title: 'Loading'
	});
	query_pics(e.detail);
};

const redo = async () => {
	load_toast.addToast({
		title: 'Reloading'
	});
	query_pics(current_url, -1);
};

let loading = false;
export const ui_redo = async () => {
	if (loading) {
		return;
	}
	redo();
}
Elements.common.reader_reload = redo;
//@ts-ignore
window.redo = redo;


const QUERY_NOTIFICATION_TIME = 10000;
const query_pics = async (url: string, position?: number) => {
	loading = true;
	const start = Date.now();
	const form = new FormData();
	form.append('url', url);
	//@ts-ignore
	window.current_url = url;
	current_url = url;
	const notify_permission = notify_start();
	let response;
	try {
		response = await fetch('//127.0.0.1:5000', {
			method: 'POST',
			body: form,
		});
	} catch (e) {
		load_toast.addToast({
			title: 'Error connecting to server',
			body: 'Check that the server is running',
		});
		throw e;
	}
	const [urls, title] = await response.json();
	if (position === -1) {
		position = reader.position;
	}
	set_urls(urls, title, position);
	const end = Date.now();
	if (end - start > QUERY_NOTIFICATION_TIME) {
		if (await notify_permission) {
			notify_send('Loaded Gallery', {body: title, silent: true});
		} else {
			load_toast.addToast({
				title: 'Loaded Gallery',
				body: title,
			});
		}
	}
	loading = false;
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
				break;
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
		const a = fragment.querySelector('a.folder') as HTMLParagraphElement;
		const div = fragment.querySelector('div.folder') as HTMLDivElement;
		const img = fragment.querySelector('img.folder') as HTMLImageElement;
		const folder_url = LOCAL_FILES_BASE + '/' + url

		const event_listener = () => {
			a.className += ' visited';
			visit_local_link(folder_url, name);
		};
		img.addEventListener('click', event_listener);
		a.addEventListener('click', event_listener);
		a.addEventListener('keypress', (e) => {
			console.log(e.key);
			if (e.key === 'Enter') {
				event_listener();
			}
		});
		a.textContent = name;
		a.title = name;
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

export const set_urls = (img_urls: Array<string>, title: string = 'MPV Reader', position: number = 0) => {
	reset_fails();
	requestAnimationFrame(() => {
		page_count.value = position.toString();
	});
	reader.set_and_jump(img_urls, position);
	document.title = title;
	zoom_factor = 1;
	set_zoom_factor(zoom_factor);
	requestAnimationFrame(() => {
		page_count.max = (img_urls.length - 1).toString();
		page_total.textContent = '/ ' + img_urls.length.toString();
	});
	dialog.hide();
}

let seen_fails: number[] = [];
let fails: number[] = [];
let fails_total = new Set();
const notify_fail_toast = new ToasterContext(toaster);
const CHECK_BEHIND = 20;
const ACCEPTED_FAILS = 2;
const EXCLUSION_ZONE = 15;
const FAIL_NOTIFICATION_TIMEOUT = 7000;


const fail_toast_manager = (() => {
	class FailToastManager {
		redo = false;
		body = '';
		title = '';
		toast = new ToasterContext(toaster);
		make_fail_toast (): ToastData {
			const toast_data: ToastData = {
				title: this.title,
				body: this.body,
			}
			if (!loading && this.redo) {
				toast_data.buttons = ['Reload images'];
			} else {
				toast_data.timeout = FAIL_NOTIFICATION_TIMEOUT;
			}
			return toast_data;
		}
		update_fail_toast () {
			const toast_data = this.make_fail_toast();
			const previous = notify_fail_toast.toast === null;
			notify_fail_toast.addToast(toast_data);
			if (previous) {
				notify_fail_toast.toast!.addEventListener('toast_button_click', (e) => {
					e.preventDefault();
					ui_redo();
					this.make_fail_toast();
				});
			}
		};
		reset() {
			this.redo = false;
			this.body = '';
			this.title = '';
		}
	}
	return new FailToastManager();
})();

const reset_fails = () => {
	seen_fails = [];
	fails = [];
	fails_total = new Set();
	fail_toast_manager.reset();
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
	console.log(fails_total);
	const fail_line = `${fails_total.size} images have failed to load`;
	if (!fail_toast_manager.redo) {
		fail_toast_manager.title = 'Failed image loads';
	}
	fail_toast_manager.body = fail_line;
	fail_toast_manager.update_fail_toast();
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
		fail_toast_manager.title = 'Excessive image load fails';
		fail_toast_manager.redo = true;
		fail_toast_manager.update_fail_toast();
	}
};

const check_fails = () => {
	let i = 0;
	const tracked_fails: Array<number> = [];
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
	});
};


const notify_start = async () => {
	if (Notification.permission == 'granted') {
		return true;
	} else if (Notification.permission == 'default') {
		const permission = await Notification.requestPermission();
		if (permission) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};

const notify_send = (title: string, options?: NotificationOptions) => {
	if (Notification.permission == 'granted') {
		return new Notification(title, options);
	}
	return null;
};


export default main;
