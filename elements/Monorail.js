'use strict'

{
const main = async () => {
	let state = 0;
	let station_count;
	let stations = []; // char[10][10] stations
	let times = []; // byte[10] times
	let stop_duration;
	let station_counter = 0;

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
		}
		log();
	}

	keypad.callback = callback;
	init();
	console.log('hi');
}

main();
}
