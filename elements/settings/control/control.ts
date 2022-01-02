const recommends: Array<string> = ['container-rotate'];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4} from '../../elements_backbone.js';
import {removeChildren} from '../../elements_helper.js';
import {get_theme_options, get_setting, set_setting, get_default_setting, remove_setting} from '../../elements_options.js';
import { ContainerRotate } from '../../container/rotate/rotate.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'SettingsControl';

const ANIMATION_VARS = ['short_duration', 'medium_duration', 'long_duration'];

/**
 * [SettingsControl Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export class SettingsControl extends backbone4 {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);

		const theme = template.querySelector('select[name=\'theme\']') as HTMLSelectElement;
		removeChildren(theme);
		for (const value of get_theme_options()) {
			const option = document.createElement('option');
			option.value = value.location;
			option.innerText = value.name;
			requestAnimationFrame(() => {
				theme.append(option);
			});
		}
		requestAnimationFrame(() => {
			theme.value = get_setting<string>('theme');
		});
		theme.addEventListener('change', () => {
			Elements.setTheme(theme.value);
		});

		const saved_scalar = get_setting<number>('animation_scale', 1).toString();
		const animation_simple_range = template.querySelector('#animation_simple input[type=\'range\']') as HTMLInputElement;
		const animation_simple_number = template.querySelector('#animation_simple input[type=\'number\']') as HTMLInputElement;
		this.#linkRangeNumber(animation_simple_range, animation_simple_number, saved_scalar, (value) => {
			const scalar = parseFloat(value);
			set_setting('animation_scale', scalar);
			for (const setting of ANIMATION_VARS) {
				set_setting(setting, get_default_setting<number>(setting) * scalar);
			}
			reset();
		});


		const animation_long_range = template.querySelector('#animation input[name="animation_long_range"]') as HTMLInputElement;
		const animation_long_number = template.querySelector('#animation input[name="animation_long_number"]') as HTMLInputElement;
		const animation_medium_range = template.querySelector('#animation input[name="animation_medium_range"]') as HTMLInputElement;
		const animation_medium_number = template.querySelector('#animation input[name="animation_medium_number"]') as HTMLInputElement;
		const animation_short_range = template.querySelector('#animation input[name="animation_short_range"]') as HTMLInputElement;
		const animation_short_number = template.querySelector('#animation input[name="animation_short_number"]') as HTMLInputElement;

		const reset = () => {
			const long_duration = get_setting<number>('long_duration').toString();
			animation_long_range.value = long_duration;
			animation_long_number.value = long_duration;
			const medium_duration = get_setting<number>('medium_duration').toString();
			animation_medium_range.value = medium_duration;
			animation_medium_number.value = medium_duration;
			const short_duration = get_setting<number>('short_duration').toString();
			animation_short_range.value = short_duration;
			animation_short_number.value = short_duration;
		};

		const long_duration = get_setting<number>('long_duration').toString();
		const medium_duration = get_setting<number>('medium_duration').toString();
		const short_duration = get_setting<number>('short_duration').toString();

		this.#linkRangeNumber(animation_long_range, animation_long_number, long_duration, (value) => {
			const duration = parseInt(value);
			set_setting('long_duration', duration);
		});
		this.#linkRangeNumber(animation_medium_range, animation_medium_number, medium_duration, (value) => {
			const duration = parseInt(value);
			set_setting('medium_duration', duration);
		});
		this.#linkRangeNumber(animation_short_range, animation_short_number, short_duration, (value) => {
			const duration = parseInt(value);
			set_setting('short_duration', duration);
		});

		const animation_buttons = template.querySelectorAll('button[name="animation_extend"]') as NodeListOf<HTMLButtonElement>;
		const button_rotate = template.querySelector('.button_rotate') as ContainerRotate;
		const options_rotate = template.querySelector('.animation_rotate') as ContainerRotate;
		animation_buttons[0].addEventListener('click', () => {
			button_rotate.current = 's2';
			options_rotate.current = 's2';
		});
		animation_buttons[1].addEventListener('click', () => {
			button_rotate.current = 's1';
			options_rotate.current = 's1';
		});

		const default_settings = () => {
			for (const setting of ANIMATION_VARS) {
				remove_setting(setting);
			}
			remove_setting('animation_scale');
			Elements.setTheme(null);
			reset();
			animation_simple_range.value = '1';
			animation_simple_number.value = '1';
			theme.value = get_setting<string>('theme');
		};
		(template.querySelector('button[name="Reset"]') as HTMLButtonElement).addEventListener('click', () => {
			default_settings();
		});

		//Fancy code goes here
		shadow.appendChild(template);
	}
	static get observedAttributes() {
		return [];
	}
	#linkRangeNumber(range: HTMLInputElement, number: HTMLInputElement, initial: string, accept: (_: string) => void) {
		range.value = initial;
		number.value = initial;
		range.addEventListener('change', () => {
			number.value = range.value;
			accept(range.value);
		});
		number.addEventListener('blur', () => {
			range.value = number.value;
			accept(number.value);
		});
		number.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				range.value = number.value;
			}
			accept(number.value);
		});
	}
}

export default SettingsControl;

Elements.load(SettingsControl, 'elements-settings-control');
