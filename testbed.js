'use strict';

class spam {
	constructor () {
		this.hello = 'world';

	}
}

class test extends spam {
	constructor () {
		super();

		debugger;

		let something = () => {
			console.log(this.hello);
		};
	}
}

class test2 extends HTMLElement {
	constructor () {
		super();

		let something = () => {
			console.log(this);
		};
	}
}

// let b = new test2();
// let a = new test();
let props = new Set();

class Sentinel extends HTMLElement {
	constructor () {
		super();
		for (var variable in this) {
			props.add(variable);
		}
	}
}

customElements.define('test-c', Sentinel);
let a = new Sentinel();

class back extends HTMLElement {
	constructor () {
		super();
		let total = 0;
		for (var variable in this) {
			total += 1;
			if (!props.has(variable)) {
				console.log('Found property: ' + variable + ' with value: ' + this[variable].toString());
				delete this[variable];
			}
		}
		console.log(total);
	}
}

class facing extends back {
	constructor () {
		super();
		console.log('After: ' + this.data);
	}
	get data () {
		return 'nope!';
	}
	set data (value) {
		console.log('Not happening');
	}
	get try () {
		return 'nope!';
	}
	set try (value) {
		console.log('Not happening');
	}
}

let b = document.createElement('test-e');
b.data = 'Hello World!';
document.body.appendChild(b);
customElements.define('test-e', facing);
