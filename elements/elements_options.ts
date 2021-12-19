const STORAGE_STRING = 'ELEMENTS_ELEMENTS_OPTIONS';


let options: {[key: string]: unknown};
{
	const storage_string = localStorage[STORAGE_STRING];
	if (storage_string === undefined) {
		options = {};
	} else {
		options = JSON.parse(storage_string);
	}
}

let timeout: ReturnType<typeof requestIdleCallback> = 0;


const updateChanges = () => {
	console.log('test');
	localStorage[STORAGE_STRING] = JSON.stringify(options);
	timeout = 0;
	document.removeEventListener('visvisibilitychange', updateChanges);
}

export const get_setting = <T>(property: string, initial: T): T => {
	return options[property] as T ?? initial;
};


export const set_setting = <T>(property: string, value: T) => {
	options[property] = value;
	if (timeout === 0) {
		timeout = requestIdleCallback(updateChanges);
		document.addEventListener('visibilitychange', updateChanges, {passive: true});
	}
};
