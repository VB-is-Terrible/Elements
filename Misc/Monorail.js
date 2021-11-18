'use strict'

let play;
{
const main = async () => {
	let state = 0;
	let station_count;
	let stations = []; // char[11][10] stations, one extra for null terminator
	let times = []; // byte[10] times
	let stop_duration;
	let station_counter = 0;
	let tourist = false;
	let led_state = false;
	let running = false;
	let stopped = false;
	await Elements.get('monorail-keypad');
	let keypad = document.querySelector('elements-monorail-keypad');

	let check_number = (n) => {
		if (n > 10 || 0 >= n) {
			return false;
		} else {
			return true;
		}
	};

	let check_time = (n) => {
		if (n > 5 || n < 2) {
			return false;
		} else {
			return true;
		}
	};

	let atoi = (s) => {
		let i = 0;
		for (let char of s) {
			i *= 10;
			i += char.charCodeAt(0) - '0'.charCodeAt(0);
		}
		return i;
	};

	let monorail_start, stop;
	let init = () => {
		keypad.query_string = 'Station Number: ';
		keypad.mode = 'number';
		keypad.length = 2;
		keypad.reset();
	};

	let station_name = () => {
		keypad.query_string = 'Station ' + String.fromCharCode(station_counter + '0'.charCodeAt(0)) + ' name: ';
		keypad.mode = 'word';
		keypad.length = 10;
		keypad.reset();
	};

	let station_time = () => {
		keypad.query_string = 'Station ' + String.fromCharCode(station_counter + '0'.charCodeAt(0)) + ' time: ';
		keypad.mode = 'number';
		keypad.length = 2;
		keypad.reset();
	};

	let stop_time = () => {
		keypad.query_string = 'Stop time: ';
		keypad.mode = 'number';
		keypad.length = 1;
		keypad.reset();
	};

	let end = () => {
		keypad.query_string = 'Init complete';
		keypad.mode = 'number';
		keypad.length = 1;
		keypad.reset();
		setTimeout((e) => {
			monorail_start();
		}, 5000)
	}

	let log = () => {
		console.log('state', state);
		console.log('station count', station_count);
		console.log('stations', stations);
		console.log('times', times);
		console.log('stop time', stop_duration);
		console.log('station counter', station_counter);
		console.log('');
	};
	let callback = (string) => {
		let n = 999; // JS stuff
		switch (state) {
			case 0:
				n = atoi(string);
				if (check_number(n)) {
					station_count = n;
					station_name();
					state += 1;
				} else {
					init();
				}
				break;
			case 1:
				stations[station_counter] = string;
				station_counter += 1;
				if (station_counter === station_count) {
					station_counter = 0;
					station_time();
					state += 1;
				} else {
					station_name();
				}
				break;
			case 2:
				n = atoi(string);
				if (check_number(n)) {
					times[station_counter] = n;
					station_counter += 1;
					if (station_counter === station_count) {
						station_counter = 0;
						stop_time();
						state += 1;
					} else {
						station_time();
					}
				} else {
					station_time();
				}
				break;
			case 3:
				n = atoi(string);
				if (check_time(n)) {
					stop_duration = n;
					state += 1;
					end();
				} else {
					stop_time();
				}
				break;
			case 4:
				if (running) {
					stop();
				}
		}
		log();
	}

	keypad.callback = callback;
	init();
	console.log('hi');
	let monorail_next;
	let timer;
	let led_timer;
	let blink_leds = () => {
		setTimeout((e) => {
			led_timer = _blink_leds();
		}, 1/3 * 1000);
	}
	let _blink_leds = () => {
		if (led_state) {
			board.led0 = true;
			board.led1 = true;
		} else {
			board.led0 = false;
			board.led1 = false;
		}
		led_state = !led_state
		led_timer = setTimeout((e) => {
			_blink_leds();
		}, 1/3 * 1000);

	}
	let stop_leds = () => {
		board.led0 = false;
		board.led1 = false;
		led_state = false;
		clearTimeout(led_timer);
	}
	monorail_start = () => {
		station_counter = 0;
		monorail_next();
	};
	monorail_next = () => {
		if (tourist) {
			tourist = false;
			blink_leds();
			setTimeout((e) => {
				monorail_next();
			}, stop_duration * 1000);
			running = false;
			board.speed = 0;
		} else {
			// Don't stop
			// Next station
			// Update info
			keypad.mode = 'monorail';
			board.speed = 60;
			stop_leds();
			timer = new Timer((e) => {
				monorail_next();
			}, times[station_counter] * 1000);
			station_counter += 1;
			station_counter %= station_count;
			// Post increment
			keypad.query_string = 'Next: ' + stations[station_counter];
			keypad.reset();
			running = true;
		}
	}
	let pb0 = () => {
		tourist = true;
	};
	let pb1 = () => {
		tourist = true;
	};
	let board = document.querySelector('elements-monorail-output');
	board.addEventListener('PB1', (e) => {
		pb1();
	});
	board.addEventListener('PB0', (e) => {
		pb0();
	});
	class Timer {
		// Just use the suspend bit
		constructor (func, timeout) {
			this.function = func;
			this.start_time = performance.now();
			this._duration = timeout
			this.timeout = setTimeout(func, timeout);
			this.paused = false;
		}
		pause () {
			if (this.paused) {return;}
			let now = performance.now();
			this._duration = now - this.start_time;
			clearTimeout(this.timeout);
			this.paused = true;
		}
		play () {
			if (!this.paused) {return;}
			this.start_time = performance.now();
			this.timeout = setTimeout((e) => {
				console.log('hit');
				this.function();
			}, this._duration);
			this.paused = false;
		}
	}
	stop = () => {
		if (!stopped) {
			stopped = true;
			blink_leds();
			board.speed = 0;
			timer.pause();
		} else {
			stopped = false;
			stop_leds();
			board.speed = 60;
			timer.play();
		}
	}
	play = () => {
		state = 4;
		station_count = 3;
		stations = ['WC', 'HE', 'CH'];
		times = [3,4,5];
		stop_duration = 2;
		station_counter = 3;
		monorail_start();
	}
}

main();
}
