const recommends: Array<string> = [];
const requires: Array<string> = [];

import {Elements} from '../../elements_core.js';
import {backbone4, applyPriorProperties} from '../../elements_backbone.js';
import {get_border_box, removeChildren, wait} from '../../elements_helper.js';
import {fuzzy} from '../../common/Searcher.js';

Elements.get(...recommends);
await Elements.get(...requires);

const ELEMENT_NAME = 'Projects3Tagbar';
/**
 * [Projects3Tagbar Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */

const ricContext = (): (f: (timestamp: IdleDeadline) => void) => void => {
        let raf: number | null = null;
        return (f) => {
                if (raf !== null) {
                        cancelIdleCallback(raf);
                }
                raf = requestIdleCallback((e) => {
                        f(e);
                        raf = null;
                });
        };
};



export class Projects3Tagbar extends backbone4 {
	#ro;
	#suggestions: HTMLDivElement;
	#predict_timeout = ricContext();
	#input;
	#tags_possible: string[] = [];
	#ready = true;
	#remote = '';
	#cleared = false;
	#search_results: Iterable<string> = [];
	#focused = false;
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		const template = Elements.importTemplate(ELEMENT_NAME);
		const input = template.querySelector('#bar_input') as HTMLInputElement;
		this.#suggestions = template.querySelector('.suggestion_holder') as HTMLDivElement;
		this.#ro = new ResizeObserver((resizeList) => {
			this.#resize(resizeList);
		});
		this.#ro.observe(input);
		input.addEventListener('keydown', () => {
			if (!this.#ready) {
				this.#ready = true;
				this.#fetch_tags();
			}
			this.#predict_timeout(() => {
				this.#predict();
			});
		});
		input.addEventListener('focusin', () => {
			this.#show_predict(this.#search_results);
		});
		this.addEventListener('focusout', async () => {
			await wait(0);
			if (this.#focused) {
				this.#focused = false;
				return;
			}
			this.#cleared = true;
			removeChildren(this.#suggestions);
		});
		this.#input = input;
		const accept = template.querySelector('#bar_button') as HTMLButtonElement;
		accept.addEventListener('click', this.#accept);
                this.#input.addEventListener('keypress', (e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                                this.#accept();
                        }
                });

		//Fancy code goes here
		shadow.appendChild(template);
		applyPriorProperties(this, 'remote');
	}
	static get observedAttributes() {
		return [];
	}
	#resize(resizeList: ResizeObserverEntry[]) {
		const width = get_border_box(resizeList[resizeList.length - 1]).inlineSize;
		requestAnimationFrame(() => {
			this.#suggestions.style.width = `${width}px`;
		});
	}
	#predict() {
		this.#search_results = this.predict(this.#input.value);
		this.#show_predict(this.#search_results);
	}
	predict(input: string) {
		if (input === '') {
			return [];
		}
		return fuzzy(input, this.#tags_possible, (v) => v);
	}
	#show_predict(predictions: Iterable<string>) {
		if (!this.#cleared) {
			removeChildren(this.#suggestions);
		}
		this.#cleared = false;
		for (const prediction of predictions) {
			const p = document.createElement('div');
			p.className = 'suggestion';
			p.addEventListener('click', () => {
				this.#input.value = prediction;
				this.#input.focus();
				this.#cleared = true;
				this.#focused = false;
				removeChildren(this.#suggestions);
			});
			p.addEventListener('mousedown', () => {
				this.#focused = true;
				console.log('focus');
			});
			p.textContent = prediction;
			requestAnimationFrame(() => {
				this.#suggestions.append(p);
			});
		}
	}
	async #fetch_tags() {
		if (this.#remote === '') {
			return;
		}
		this.#tags_possible = await (await fetch(this.#remote)).json();
		if (this === document.activeElement) {
			this.#predict();
		}
	}
        #accept () {
                let valid = false;
                for (const option of this.#tags_possible) {
                        if (option === this.#input.value) {
                                valid = true;
                                break;
                        }
                }
                if (!valid) {
                        return;
                }
                this.dispatchEvent(CustomComposedEvent('accept', this.#input.value));
        };
	get remote() {
		return this.#remote;
	}
	set remote(value: string) {
		this.#remote = value;
		this.#ready = false;
	}
}

export default Projects3Tagbar;

Elements.load(Projects3Tagbar, 'elements-projects3-tagbar');
