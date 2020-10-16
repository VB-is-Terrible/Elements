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
const folders = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipisicing', 'elit,', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua.', 'Ut', 'enim', 'ad', 'minim', 'veniam,', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat.', 'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur.', 'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident,', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum.', 'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipisicing', 'elit,', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua.', 'Ut', 'enim', 'ad', 'minim', 'veniam,', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat.', 'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur.', 'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident,', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum.', 'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipisicing', 'elit,', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua.', 'Ut', 'enim', 'ad', 'minim', 'veniam,', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat.', 'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur.', 'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident,', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum.', 'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipisicing', 'elit,', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua.', 'Ut', 'enim', 'ad', 'minim', 'veniam,', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat.', 'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla', 'pariatur.', 'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident,', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum.'];
const fill_folders = (folder_names) => {
    const columns = 5;
    const folder_grid = document.querySelector('#folder_grid');
    const rows = Math.ceil((folder_names.length) / columns);
    folder_grid.columns = columns;
    folder_grid.rows = rows;
    console.log(folder_names.length);
    let children = [...folder_grid.children];
    requestAnimationFrame(() => {
        for (let img of children) {
            img.remove();
        }
    });
    let count = 1;
    for (const folder of folder_names) {
        const p = document.createElement('p');
        p.innerHTML = folder;
        p.slot = 's' + count.toString();
        // p.style.width = '10em';
        // p.style.height = '10em';
        p.className = 'folder';
        requestAnimationFrame(() => {
            folder_grid.append(p);
        });
        count += 1;
    }
};
const test = () => {
    fill_folders(folders);
};
test();
