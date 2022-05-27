import { Elements } from '../elements/elements_core.js';
import { ProjectGroup } from '../elements/projects3/Common/Common.js';
const load_promise = Elements.get('toaster');
Elements.get('container-stacked');
const ROOT_LOCATION = '//127.0.0.1:5002';
const project_link = document.querySelector('a.project_link');
const title = document.querySelector('p.group_title');
const desc = document.querySelector('textarea.group_desc');
const title_editor = document.querySelector('#group_name_edit');
const button_stack = document.querySelector('div.bottom_buttons > elements-container-stacked');
const title_stack = document.querySelectorAll('.title_stack_holder > .stacked.centre');
const toaster = document.querySelector('#toaster');
export let system;
const getRemoteLocation = () => {
    const params = new URL(document.location.href).searchParams;
    return `${ROOT_LOCATION}/groups/${params.get('group')}`;
};
const remote_location = getRemoteLocation();
await load_promise;
export const main = () => {
    const edit_button = document.querySelector('#group_edit_enable');
    edit_button.addEventListener('click', () => {
        toggle_edit(true);
    });
    const cancel_button = document.querySelector('#group_edit_cancel');
    cancel_button.addEventListener('click', () => {
        reset();
    });
    const accept_button = document.querySelector('#group_edit_accept');
    accept_button.addEventListener('click', () => {
        modifyNetworkGroup(title_editor.value, desc.value);
    });
    (async () => {
        load_remote();
    })();
};
const load_remote = async () => {
    const remote_data = await (await fetch(remote_location)).json();
    console.log(remote_data);
    system = ProjectGroup.fromNetworkObj(remote_data.group);
    load(system, remote_data.owner);
    return system;
};
const load = (system, owner) => {
    document.title = system.name;
    {
        const folders = window.location.pathname.split('/');
        folders.pop();
        project_link.href = `${window.location.origin}${folders.join('/')}/projects3.html?meta=${owner}`;
    }
    reset();
};
const reset = () => {
    toggle_edit(false);
    title.textContent = system.name;
    title_editor.value = system.name;
    desc.value = system.desc;
};
const toggle_edit = (editmode) => {
    if (editmode) {
        requestAnimationFrame(() => {
            title_stack[0].style.display = 'none';
            title_stack[1].style.display = 'grid';
            title_editor.focus();
        });
    }
    else {
        requestAnimationFrame(() => {
            title_stack[0].style.display = 'grid';
            title_stack[1].style.display = 'none';
        });
    }
    button_stack.current = !editmode ? 's1' : 's2';
    title_editor.disabled = !editmode;
    desc.disabled = !editmode;
};
const modifyNetworkGroup = async (title, desc) => {
    const form = new FormData();
    if (title !== system.name) {
        form.append('name', title);
    }
    if (title !== system.desc) {
        form.append('desc', desc);
    }
    let response;
    try {
        response = await fetch(remote_location, {
            method: 'POST',
            body: form,
        });
    }
    catch (e) {
        toaster.addToast({
            title: 'Error connecting to server',
            body: 'Check that the server is running',
        });
        throw e;
    }
    const return_code = await response.json();
    if (return_code !== true) {
        return;
    }
    system.name = title;
    system.desc = desc;
    reset();
};
