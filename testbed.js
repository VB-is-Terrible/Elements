'use strict';

class spam {
	constructor () {
		this.hello = 'world';

	}
}

class test extends spam {
	constructor () {
		super();

		// debugger;

		let something = () => {
			console.log(this.hello);
		};
	}
}

class test2 extends HTMLElement {
	constructor () {
		super();

		debugger;
		let something = () => {
			console.log(this);
		};
	}
}

window.customElements.define('a-check-class', test2);
let y = new test2();
let x = new test();
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
	connectedCallback () {
		for (let attribute of this.constructor.observedAttributes) {
			console.log('Reading attribute ' + attribute);
		}
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
	static get observedAttributes () {
		return ['this', 'is', 'a', 'test'];
	}
}

let b = document.createElement('test-e');
b.data = 'Hello World!';
document.body.appendChild(b);
customElements.define('test-e', facing);

class backbone extends HTMLElement {
	constructor () {
		super();
		let total = 0;
		this.storeMap = new Map();
		for (var variable in this) {
			total += 1;
			if (variable === 'storeMap') {
				continue;
			}
			if (!props.has(variable)) {
				console.log('Found property: ' + variable + ' with value: ' + this[variable].toString());
				this.storeMap.set(variable, this[variable]);
				delete this[variable];
			}
		}
		console.log(total);
	}
	applyProps () {
		for (let prop of this.storeMap.keys()) {
			this[prop] = this.storeMap.get(prop);
		}
	}
	connectedCallback () {
		for (let attribute of this.constructor.observedAttributes) {
			console.log('Reading attribute ' + attribute);
		}
	}
}

class real extends backbone {
	constructor () {
		super();
		this.__database = 'You screwed up';
		this.__data = 'You screwed up';
		this.applyProps();
	}
	get data () {
		return this.__data;
	}
	set data (value) {
		console.log('Updating data');
		this.__data = value
	}
	get database () {
		return this.__database;
	}
	set database (value) {
		console.log('Updating database');
		this.__database = value;
	}
	static get observedAttributes () {
		return ['this', 'is', 'a', 'test'];
	}
}

let c = document.createElement('test-f');
c.data = ['42', '39', '36', '33', '30', '27', '24', '21', '18', '15', '12', '9', '6', '3', '0'];
c.database = 'Welcome to the future'
document.body.appendChild(c);
customElements.define('test-f', real);
