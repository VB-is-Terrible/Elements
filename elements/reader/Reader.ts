{
interface dynamic extends HTMLElement {
	img_urls: Array<string>;
	position: number;
	next(): void;
	back(): void;
}

const reader = document.querySelector('#main_scroller')! as dynamic;
const page_count = document.querySelector('#page_count')! as HTMLInputElement;
const page_total = document.querySelector('#page_total')! as HTMLSpanElement;

const respond = async (e: CustomEvent) => {
	const form = new FormData();
	form.append('url', e.detail);
	const response = await fetch('//127.0.0.1:5000', {
		method: 'POST',
		body: form,
	});
	const [urls, title] = await response.json();
	document.title = title;
	reader.img_urls = urls;
	requestAnimationFrame(() => {
		page_count.value = '0';
		page_total.innerHTML = '/ ' + urls.length.toString();
	});
}

const update_page = (e: CustomEvent) => {
	requestAnimationFrame(() => {
		page_count.value = e.detail.toString();
	});
};

const main = () => {
	// @ts-ignore
	document.querySelector('#main_input').addEventListener('accept', respond);
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
	// @ts-ignore
	reader.addEventListener('positionChange', update_page);
	page_count.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			reader.position = parseInt(page_count.value);
			page_count.value = '';
		}
	});
}

main();

// @ts-ignore
Elements.loaded('Reader');

console.log('Done');

}
