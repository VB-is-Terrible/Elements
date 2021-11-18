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

		template.querySelector('#picture').addEventListener('load', (e) => {
			self._set_picture_dim(e);
		})
		//Fancy code goes here
		shadow.appendChild(template);
	}
	setName (name) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let name_out = body.querySelector('p.name');
		name_out.textContent = name;
	}
	setTime (time) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let time_out = body.querySelector('p.time');
		let time_obj = new Date(time);
		time_out.textContent = time_obj.toLocaleString();
	}
	setProfile (img_location) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let profile = body.querySelector('#profile');
		profile.src = img_location;
	}
	setText (text) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let text_out = body.querySelector('.text');
		text_out.textContent = text;
	}
	setPicture (img_location) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let picture = body.querySelector('#picture');
		picture.src = img_location;
	}
	_set_picture_dim (e) {
		let body = this.shadowRoot.querySelector('#pseudoBody');
		let img = body.querySelector('#picture');
		let aspect_ratio = img.naturalWidth / img.naturalHeight;
		let width, height;
		if (aspect_ratio > .5) {
			width = 400;
			height = width / aspect_ratio;
		} else {
			height = 800;
			width = aspect_ratio * height;
		}
		img.style.width = width.toString() + 'px';
		img.style.height = height.toString() + 'px';

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
