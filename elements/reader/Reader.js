"use strict";
let current_url = '';
{
    const reader = document.querySelector('#main_scroller');
    const page_count = document.querySelector('#page_count');
    const page_total = document.querySelector('#page_total');
    const main_input = document.querySelector('#main_input');
    const respond = async (e) => {
        // @ts-ignore
        main_input.value = '';
        const form = new FormData();
        form.append('url', e.detail);
        current_url = e.detail;
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
    };
    const update_page = (e) => {
        requestAnimationFrame(() => {
            page_count.value = e.detail.toString();
        });
    };
    const page_update = (e) => {
        const page = parseInt(page_count.value);
        reader.position = page;
    };
    const main = () => {
        // @ts-ignore
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
        // @ts-ignore
        reader.addEventListener('positionChange', update_page);
        page_count.addEventListener('change', page_update);
    };
    main();
    // @ts-ignore
    Elements.loaded('Reader');
}
