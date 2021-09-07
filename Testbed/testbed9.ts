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
