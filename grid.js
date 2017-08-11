'use strict'

Elements.elements.Grid = class extends Elements.elements.backbone {
	constructor () {
		super();
		this.name = "Grid";
		const shadow = this.attachShadow({ mode: 'open' });
		const template = Elements.importTemplate(this.name);

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
		};

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

		shadow.appendChild(template);
	}
	static get observedAttributes () {
		return ['rows', 'columns'];
	}
	connectedCallback () {
		super.connectedCallback();
		this.ro.observe(this.shadowRoot.querySelector('#canaryDiv'));
		this.ro.observe(this.shadowRoot.querySelector('#pseudoBody'));
		// this.ro.observe(this.shadowRoot.querySelector('#gridHolder'));
		this.updateGrid();
	}
	disconnectedCallback () {
		this.ro.disconnect();
	}
	updateGrid () {
		// Don't bother resizing before connection
		if (this.attributeInit) {
			let rows = this.rows;
			let cols = this.columns;

			let gridElement = this.shadowRoot.querySelector('#gridHolder');


			let positions = rows * cols;

			let updater = () => {
				gridElement.style.gridTemplateRows = "1fr ".repeat(rows)
				gridElement.style.gridTemplateColumns = "1fr ".repeat(cols);
				gridElement.style.gridTemplateAreas = this.constructor.generateGridNames(rows, cols);

				this.updateDivs(positions);

				let holderDivs = gridElement.querySelectorAll('div.HolderDiv');

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
		let findSheet = (cssSelector) => {
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
			}
			return [insertSheet, position];
		};
		let parent = this.shadowRoot.querySelector('#gridHolder');
		// If the grid is been expanded, e = [canaryDiv, pseudoBody]
		// But if the grid is been shrunk and a cell refuses to shrink,
		// e = [pseudoBody]
		let [holderDivStyle, holderDivLocation] = findSheet("div.HolderDiv");
		if (e.length === 1) {
			holderDivStyle.cssRules[holderDivLocation].style.width = "20%";
			requestAnimationFrame((e) => {
				holderDivStyle.cssRules[holderDivLocation].style.width = "100%";
			});
			return;
		} else {
		}
		let cr = e[0].contentRect;//parent.getBoundingClientRect();


		let gap = parseInt(getComputedStyle(parent).getPropertyValue('--grid-gap').slice(0,-2));
		// console.assert(!isNaN(gap));
		if (isNaN(gap)) {
			return false;
		}

		let width = cr.width;
		let height = cr.height;

		let rule = '--width: ' + width.toString() + 'px; ' +
			'width' + + width.toString() + 'px; ' +
			'--height: ' + height.toString() + 'px;' +
			'height: ' + height.toString() + 'px;';
		// Destory the old ::slotted style and insert a new style
		const cssSelector = "slot::slotted(.internal)";
		let [insertSheet, position] = findSheet(cssSelector);
		insertSheet.removeRule(position);
		insertSheet.addRule(cssSelector, rule, position);

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
			result += '"';
			for (let x = 0; x < columns; x++) {
				result += this.numToCharCode(i) + ' ';
				i += 1;
			}
			result += '"';
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

Elements.load('gridTemplate.html', Elements.elements.Grid, 'elements-grid')
