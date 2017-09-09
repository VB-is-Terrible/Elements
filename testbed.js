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

let b = new test2();
let a = new test();
