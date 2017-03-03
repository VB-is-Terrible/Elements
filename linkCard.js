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
		const shadow = this.createShadowRoot();
		const template = document.importNode(
         document.querySelector('#templateElementsLinkCardHolder'),
         true);

		// Needed to bind the this value
		let updateCallback = () => {
			this.updateDisplay();
		};

		let santizer = (value, oldValue) => {
			let newValue = parseInt(value);
			if (newValue > 0 && !isNaN(newValue)) {
				return newValue;
			} else {
				return oldValue;
			}
		}

		Elements.setUpSanitizedAttrPropertyLink(this, 'rows', 2,
		                                        updateCallback, santizer);
		Elements.setUpSanitizedAttrPropertyLink(this, 'columns', 2,
		                                        updateCallback, santizer);

		shadow.appendChild(template.content)
	}
	static get observedAttributes () {
		return ['rows', 'columns'];
	}
	connectedCallback () {
		super.connectedCallback();

	}
	updateDisplay () {
		// Don't bother resizing before connection
		if (this.attributeInit) {
			console.log('hi!');
			let rows = this.rows;
			let cols = this.columns;




			let gridElement = this.shadowRoot.querySelector('#gridHolder');
			window.requestAnimationFrame(() => {
				gridElement.style.gridTemplateRows = "1fr ".repeat(rows)
				gridElement.style.gridTemplateColumns = "1fr ".repeat(cols);
			});
		}


	}
};


window.customElements.define('elements-linkcard-linkcontainer', Elements.LinkCardHolder);
