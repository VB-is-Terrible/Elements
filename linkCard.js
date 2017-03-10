'use strict'

Elements.elements.LinkCardContainer = class extends Elements.elements.backbone {
	constructor () {
		super();

		let shadow = this.attachShadow({ mode: 'open' });
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
		let shadow = this.attachShadow({ mode: 'open' });
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
		const shadow = this.attachShadow({ mode: 'open' });
		const template = document.importNode(
         document.querySelector('#templateElementsLinkCardHolder'),
         true);

		// Needed to bind the this value
		let updateCallback = () => {
			this.updateGrid();
		};

		let santizer = (value, oldValue) => {
			let newValue = parseInt(value);
			if (newValue > 0 && !isNaN(newValue)) {
				return newValue;
			} else {
				return oldValue;
			}
		};

		let resizeCallback = () => {
			this.updateDisplay();
		}

		// let test = template.content.querySelector('#canaryDiv');

		this.ro = new ResizeObserver((entries) => {
			// const cr = entries[0].contentRect;
			console.log('Firing on:', entries[0].target);
			resizeCallback();

		});


		Elements.setUpSanitizedAttrPropertyLink(this, 'rows', 2,
		                                        updateCallback, santizer);
		Elements.setUpSanitizedAttrPropertyLink(this, 'columns', 2,
		                                        updateCallback, santizer);

		shadow.appendChild(template.content);
	}
	static get observedAttributes () {
		return ['rows', 'columns'];
	}
	connectedCallback () {
		super.connectedCallback();
		this.ro.observe(this.shadowRoot.querySelector('#canaryDiv'))
		this.ro.observe(this.shadowRoot.querySelector('#gridHolder'));

	}
	disconnectedCallback () {
		this.ro.disconnect
	}
	updateGrid () {
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


			this.updateDisplay();
		}
	}
	updateDisplay () {
		// console.log('updating grid');
		const cssSelector = "slot::slotted(.internal)";
		let parent = this.shadowRoot.querySelector('#gridHolder')
		let cr = parent.getBoundingClientRect();

		// The divs in elements-linkcard-link's shadowRoot prevent the
		// HolderDivs from becoming smaller, so we can't use the layout to
		// determine the correct size

		let gap = parseInt(getComputedStyle(parent).getPropertyValue('--grid-gap').slice(0,-2));
		console.assert(!isNaN(gap));
		let width = (cr.width - (this.columns - 1) * gap) / this.columns;
		let height = (cr.height - (this.rows - 1) * gap) / this.rows;

		// Destory the old ::slotted style and insert a new style
		let sheets = this.shadowRoot.styleSheets;
		let position = -1;
		let insertSheet = null;
		for (let sheet of sheets) {
			position = Array(...sheet.cssRules).findIndex((e) => {
				if (e.selectorText === cssSelector) {
					return true;
				} else {
					return false;
				}
			})
			if (position !== -1) {
				insertSheet = sheet;
				break;
			}
		}
		if (position === -1) {
			console.warn(cssSelector + " not found in any stylesheets");
		} else {
			requestAnimationFrame(() => {
				insertSheet.removeRule(position);
				insertSheet.addRule(cssSelector,
				    '--width: ' + width.toString() + 'px; ' +
				    'width' + + width.toString() + 'px; ' +
				    '--height: ' + height.toString() + 'px;', +
				    'height: ' + height.toString() + 'px;', +
				    position);
			});
		}


	}

};


window.customElements.define('elements-linkcard-linkcontainer', Elements.LinkCardHolder);
