'use strict';


Elements.elements.LinkCardLink = class extends Elements.elements.backbone {
	constructor () {
		super();
		let shadow = this.attachShadow({ mode: 'open' });
		let template = document.importNode(
		   document.querySelector('#templateElementsLinkCardLink'),
		   true);
		//

		let faviconImg = template.content.querySelector('#faviconImg');
		let linkElem = template.content.querySelector('#CardLink');
		let thumbImg = template.content.querySelector('#thumbImg');
		let titleSpan = template.content.querySelector('#titleSpan');

		let faviconChange = (value) => {
			faviconImg.src = value;
		};

		let thumbChange = (value) => {
			thumbImg.src = value;
		};

		let titleChange = (value) => {
			if (!(value === null || value === undefined)) {
				titleSpan.textContent = value;
			}
		};

		let linkChange = (value) => {
			linkElem.href = value;
		};

		Elements.setUpAttrPropertyLink(this, 'favicon','', faviconChange);
		Elements.setUpAttrPropertyLink(this, 'title', '', titleChange);
		Elements.setUpAttrPropertyLink(this, 'href', 'about:blank', linkChange);
		Elements.setUpAttrPropertyLink(this, 'src', '', thumbChange);

		shadow.appendChild(template.content);
	}
	static get observedAttributes () {
		return ['favicon', 'title', 'href', 'src']
	}
}

Elements.load('linkCardLinkTemplate.html', Elements.elements.LinkCardLink, 'elements-linkcard-link');
