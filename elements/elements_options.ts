import type {Elements_Options} from './elements_types';

const STORAGE_STRING = 'ELEMENTS_ELEMENTS_OPTIONS';
let global_options: Elements_Options;


try {
	//@ts-ignore
	global_options = ELEMENTS_OPTIONS;
} catch (e) {
	if (e instanceof ReferenceError) {
		global_options = {};
	} else {
		throw e;
	}
}


let options: {[key: string]: unknown};
const default_options: {[key: string]: unknown} = {
	'short_duration': 100,
	'medium_duration': 150,
	'long_duration': 300,
	'drop_amount': '3em',
};


{
	const storage_string = localStorage.getItem(STORAGE_STRING);
	if (storage_string === null) {
		options = {};
	} else {
		options = JSON.parse(storage_string);
	}
}

let timeout: ReturnType<typeof requestIdleCallback> = 0;


const updateChanges = () => {
	localStorage.setItem(STORAGE_STRING, JSON.stringify(options));
	timeout = 0;
	document.removeEventListener('visvisibilitychange', updateChanges);
}

export const get_setting = <T>(property: string, initial: T | undefined = undefined): T => {
	if (options[property] !== undefined) {
		return options[property] as T;
	} else if (property in global_options!) {
		return global_options![property as keyof typeof global_options]! as T;
	} else if (initial !== undefined) {
		return initial;
	} else if (property in default_options) {
		return default_options[property] as T;
	} else {
		throw Error('');
	}
};


const queueUpdate = () => {
	if (timeout === 0) {
		timeout = requestIdleCallback(updateChanges);
		document.addEventListener('visibilitychange', updateChanges, {passive: true});
	}
};

export const set_setting = <T>(property: string, value: T) => {
	options[property] = value;
	queueUpdate();
};

export const remove_setting = (property: string) => {
	delete options[property];
	queueUpdate();
};


export const get_theme_options = () => {
	return [{name: 'Vanilla', location: ''},
	        {name: 'Dark', location: 'dark-colors.css'}];
};

export const get_default_setting = <T>(property: string): T => {
	if (property in default_options) {
		return default_options[property] as T;
	} else {
		throw Error('');
	}
};
