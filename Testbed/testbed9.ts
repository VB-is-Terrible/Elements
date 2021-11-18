export class A {
	#testValue = 12;
	constructor() {
		this.#testValue = 14;
	}
	test() {
		console.log(this.#testValue);
	}
}

const a = new A();

export class B extends A {
	constructor() {
		super();
		// this.#testValue = 20;
	}
}
