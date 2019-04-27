'use strict';

Elements.get();
{
const main = async () => {

await Elements.get();
/**
 * [FakebookPost Description]
 * @augments Elements.elements.backbone2
 * @type {Object}
 */
Elements.elements.FakebookPost = class FakebookPost extends Elements.elements.backbone2 {
	constructor () {
		super();
		const self = this;

		this.name = 'FakebookPost';
		const shadow = this.attachShadow({mode: 'open'});
		let template = Elements.importTemplate(this.name);

		//Fancy code goes here
		shadow.appendChild(template);
	}
	setName (name) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let name_out = body.querySelector('p.name');
		name_out.innerHTML = Elements.nameSanitizer(name);
	}
	setTime (time) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let time_out = body.querySelector('p.time');
		let time_obj = new Date(time);
		time_out.innerHTML = time_obj.toISOString();
	}
	setProfile (img_location) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let profile = body.querySelector('#profile');
		profile.src = img_location;
	}
	setText (text) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let text_out = body.querySelector('.text');
		text_out.innerHTML = Elements.nameSanitizer(text);
	}
	setPicture (img_location) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let picture = body.querySelector('#picture');
		picture.src = img_location;
	}
	connectedCallback () {
		super.connectedCallback();
	}
	disconnectedCallback () {
		super.disconnectedCallback();
	}
	static get observedAttributes () {
		return [];
	}
};

Elements.load(Elements.elements.FakebookPost, 'elements-fakebook-post');
};

main();
}
