'use strict';

Elements.elements.LinkCardContainer = class extends Elements.elements.backbone {
	constructor () {
		super();

		const shadow = this.attachShadow({ mode: 'open' });
		let template = document.importNode(
			document.querySelector('#templateElementsLinkCardContainer'),
			true);

		let ro = new ResizeObserver((entries) => {
			for (let o of entries) {
				console.log(o);
			}
		});

		ro.observe(template.content.querySelector('#pseudoBody'));
		shadow.appendChild(template.content);
	}
};

window.customElements.define('elements-linkcard', Elements.elements.LinkCardContainer);

Elements.elements.LinkCardLink = class extends Elements.elements.backbone {
	constructor () {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
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

		shadow.appendChild(template.content)
	}
	static get observedAttributes () {
		return ['favicon', 'title', 'href', 'src']
	}
}

window.customElements.define('elements-linkcard-link', Elements.elements.LinkCardLink);



Elements.elements.LinkCardHolder = class extends Elements.elements.backbone {
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

		let resizeCallback = (e) => {
			this.updateDisplay(e);
		}

		// let test = template.content.querySelector('#canaryDiv');

		this.ro = new ResizeObserver((entries) => {
			// const cr = entries[0].contentRect;
			// console.log('Firing on:', entries[0].target);
			resizeCallback(entries);

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
		// this.ro.observe(this.shadowRoot.querySelector('#gridHolder'));
		this.updateGrid();
	}
	disconnectedCallback () {
		this.ro.disconnect
	}
	updateGrid () {
		// Don't bother resizing before connection
		if (this.attributeInit) {
			let rows = this.rows;
			let cols = this.columns;

			let gridElement = this.shadowRoot.querySelector('#gridHolder');


			let positions = rows * cols;

			let updater = () => {
				gridElement.style.gridTemplateRows = '1fr '.repeat(rows)
				gridElement.style.gridTemplateColumns = '1fr '.repeat(cols);
				gridElement.style.gridTemplateAreas = this.constructor.generateGridNames(rows, cols);

				this.updateDivs(positions);

				let holderDivs = gridElement.querySelectorAll('div.holderDiv');

				for (let i = 0; i < positions; i++) {
					holderDivs[i].style.display = 'initial';
				}
				for (let i = positions; i < holderDivs.length; i++) {
					holderDivs[i].style.display = 'none';
				}
			};

			window.requestAnimationFrame(updater);


		}
	}
	updateDisplay (e) {
		// console.log('updating grid');
		const cssSelector = 'slot::slotted(.internal)';
		let parent = this.shadowRoot.querySelector('#gridHolder')
		let cr = e[0].contentRect;//parent.getBoundingClientRect();


		let gap = parseInt(getComputedStyle(parent).getPropertyValue('--grid-gap').slice(0,-2));
		// console.assert(!isNaN(gap));
		if (isNaN(gap)) {
			return false;
		}

		let width = cr.width;
		let height = cr.height;

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
			console.warn(cssSelector + ' not found in any stylesheets');
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

	updateDivs (amount) {
		let insertionPoint = this.shadowRoot.querySelector('#gridHolder');
		let count = insertionPoint.childElementCount;
		let template = this.shadowRoot.querySelector('#templateHolderDiv');

		for (;count <= amount; count++) {
			let newDiv = document.importNode(template, true);
			let div = newDiv.content.querySelector('div.HolderDiv');
			let slot = newDiv.content.querySelector('slot.link');

			div.style.gridArea = this.constructor.numToCharCode(count + 1);
			slot.name = 's' + (count + 1).toString();
			insertionPoint.appendChild(newDiv.content);
		}
	}

	static generateGridNames (rows, columns) {
		let i = 1;
		let result = '';
		for (let y = 0; y < rows; y++) {
			result += '\'';
			for (let x = 0; x < columns; x++) {
				result += this.numToCharCode(i) + ' ';
				i += 1;
			}
			result += '\'';
		}
		return result;
	}

	static numToCharCode (num) {
		const base = 26;
		let result = [];

		while (num > 0) {
			let mod = num % base;
			result.push(mod + 96);
			num -= mod;
			num /= base;
		}

		result.reverse();
		return String.fromCodePoint(...result);
	}

};

window.customElements.define('elements-linkcard-linkcontainer', Elements.elements.LinkCardHolder);

Elements.elements.LinkCardButtons = class extends Elements.elements.backbone {
	constructor () {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
		let template = document.importNode(
			document.querySelector('#templateElementsLinkCardButtons'),
			true);

		shadow.appendChild(template.content)
	}
}

window.customElements.define('elements-linkcard-buttons', Elements.elements.LinkCardButtons);
