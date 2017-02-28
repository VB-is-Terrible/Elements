'use strict'

Elements.elements.LinkCardContainer = class extends Elements.elements.backbone {
	constructor () {
		super();

		let shadow = this.createShadowRoot();
	   let template = document.importNode(
	      document.querySelector('#templateElementsLinkCardContainer'),
	      true);
		shadow.appendChild(template.content)
	}
};

window.customElements.define('elements-linkcard', Elements.elements.LinkCardContainer);

Elements.elements.LinkCardLink = class extends Elements.elements.backbone {
	constructor () {
		super();
		let shadow = this.createShadowRoot();
		let template = document.importNode(
		   document.querySelector('#templateElementsLinkCard'),
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

		shadow.appendChild(template.content)
	}
	static get observedAttributes () {
		return ['favicon', 'title', 'href', 'src']
	}
}

window.customElements.define('elements-linkcard-link', Elements.elements.LinkCardLink);



Elements.LinkCardHolder = class extends Elements.elements.backbone {
	constructor () {
		super();
		let shadow = this.createShadowRoot();
      let template = document.importNode(
         document.querySelector('#templateElementsLinkCardHolder'),
         true);

		Elements.setUpAttrPropertyLink(this, 'rows', 2);
		Elements.setUpAttrPropertyLink(this, 'columns', 2);

		shadow.appendChild(template.content)
	}
	static get observedAttributes () {
		return ['rows', 'columns'];
	}
	connectedCallback () {
		super.connectedCallback();

	}
	updateDisplay () {
		let rows = this.rows;
		let cols = this.columns;
	}
};


window.customElements.define('elements-linkcard-linkcontainer', Elements.LinkCardHolder);
