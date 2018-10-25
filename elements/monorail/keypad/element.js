'use strict';

Elements.get('grid');
{
const ms = 1000;
const wait = 2 * ms;
const main = async () => {

await Elements.get();
/**
 * [MonorailKeypad Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.MonorailKeypad = class MonorailKeypad extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;
		this.display = '';
		this.current_key = '';
		this.current_count = 0;
		this.timer = null;
		this.mode = 'word';
		this.name = 'MonorailKeypad';
		this.query_string = '';
		this.length = 10;
		this.callback = null;
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here

		let buttons = template.querySelectorAll('button');
		for (let button of buttons) {
			button.addEventListener('click', (e) => {
				this.button_pressed(button.id);
			});
		}

		shadow.appendChild(template);
		this.applyPriorProperties('query_string');
		this.update_display();
	}
	button_pressed (button) {
		if (this.mode == 'monorail') {
			if (button === '=') {
				this.callback(this.display);
			}
			return;
		}
		if (button === 'A') {
			this.reset();
		} else if (button === 'B') {
			this.button_tick(); // Flush pending buffer
			this.callback(this.display);
		} else if (this.mode === 'word') {
			this.button_pressed_word(button);
		} else {
			this.button_pressed_number(button);
		}
	}
	button_pressed_number (button) {
		switch (button) {
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '0':
				this.current_key = button;
				this.button_tick();
				break;
			default:
		}
	}
	button_pressed_word (button) {

		switch (button) {
			case '1':
				this.button_iterate('A');
				break;
			case '2':
				this.button_iterate('D');
				break;
			case '3':
				this.button_iterate('G');
				break;
			case '4':
				this.button_iterate('J');
				break;
			case '5':
				this.button_iterate('M');
				break;
			case '6':
				this.button_iterate('P');
				break;
			case '7':
				this.button_iterate('S');
				break;
			case '8':
				this.button_iterate('V');
				break;
			case '9':
				this.button_iterate('Y');
				break;
			default:

		}
	}
	button_iterate (char) {
		if (this.current_key === char) {
			this.current_count += 1;
		} else {
			this.button_tick();
			this.current_key = char;
			this.current_count = 0;
		}
		clearTimeout(this.timer);
		this.timer = setTimeout((e) => {
			this.button_tick();
		}, wait);
		this.update_temp_display();
	}
	button_tick () {
		if (this.mode === 'word') {
			this.button_tick_word();
		} else {
			this.button_tick_number();
		}
	}
	button_tick_word () {
		if (this.current_key === '') {return;}
		let code = this.current_key.charCodeAt(0) + (this.current_count % 3);
		if (code === '['.charCodeAt(0)) {code = ' '.charCodeAt(0);}
		let letter = String.fromCharCode(code);
		this.button_tick_add(letter);
	}
	button_tick_number () {
		if (this.current_key === '') {return;}
		this.button_tick_add(this.current_key);
	}
	button_tick_add (letter) {
		if (this.display.length === this.length) {
			this.display = '';
		}
		this.display += letter;
		this.current_key = '';
		this.current_count = 0;
		this.update_display();
		this.update_temp_display();
	}
	update_display () {
		let p = this.shadowRoot.querySelector('#out');
		requestAnimationFrame((e) => {
			p.innerHTML = this.query_string + this.display;
		});
	}
	update_temp_display () {
		// Debug function
		let p = this.shadowRoot.querySelector('#temp_out');
		let letter;
		if (this.current_key === '') {
			letter = '#';
		} else {
			let code = this.current_key.charCodeAt(0) + (this.current_count % 3);
			if (code === '['.charCodeAt(0)) {code = ' '.charCodeAt(0);}
			letter = String.fromCharCode(code);
		}
		requestAnimationFrame((e) => {
			p.innerHTML = letter;
		})
	}
	reset () {
		this.current_count = 0;
		this.current_key = '';
		this.display = ''; // Make sure to zero all 10 digits
		// this.query_string = '';
		this.update_display();
		this.update_temp_display();
		clearTimeout(this.timer);
	}
	static get observedAttributes () {
		return ['query_string'];
	}
};

Elements.load(Elements.elements.MonorailKeypad, 'elements-monorail-keypad');
};

main();
}
