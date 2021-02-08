export const recommends = [];
export const requires = [];

import {Elements} from '../elements_core.js';
import {backbone4} from '../elements_backbone.js';
import {booleaner, setUpAttrPropertyLink} from '../elements_helper.js';


const ELEMENT_NAME = 'Grid';
/**
 * A grid where every element is the same size.
 * Child elements must have the attribute slot='s[position]'
 * @type {Object}
 * @property {Number} rows Number of rows in the grid
 * @property {Number} cols Number of columns in the grid
 * @property {Boolean} coordnaming Switches to alternate slot naming, of '[x]-[y]'
 */
export class Grid extends backbone4 {
        rows!: number;
        columns!: number;
        coordnaming!: boolean
        shadowRoot!: ShadowRoot;
	constructor () {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
		const template = Elements.importTemplate(ELEMENT_NAME);

		// Needed to bind the this value
		let updateCallback = () => {
			this.updateGrid();
		};

		let santizer = (value: unknown, oldValue: number) => {
			let newValue = Number(value);
			if (newValue > 0 && !isNaN(newValue)) {
				return newValue;
			} else {
				return oldValue;
			}
		};

		setUpAttrPropertyLink(this, 'rows', 2,
		                                        updateCallback, santizer);
		setUpAttrPropertyLink(this, 'columns', 2,
		                                        updateCallback, santizer);
		setUpAttrPropertyLink(this, 'coordnaming', false,
		                                        updateCallback, booleaner);
		shadow.appendChild(template);
	}
	static get observedAttributes () {
		return ['rows', 'columns', 'coordnaming'];
	}
	connectedCallback () {
		super.connectedCallback();
		this.updateGrid();
	}
	disconnectedCallback () {}
	/**
	 * Updates the grid to new row & col amounts
	 */
	updateGrid () {
		// Don't bother resizing before connection
		if (this.attributeInit) {
			let rows = this.rows;
			let cols = this.columns;

			let gridElement = this.shadowQuery('#gridHolder') as HTMLDivElement;


			let positions = rows * cols;

			let updater = () => {
				gridElement.style.gridTemplateRows = '1fr '.repeat(rows);
				gridElement.style.gridTemplateColumns = '1fr '.repeat(cols);
				gridElement.style.gridTemplateAreas = Grid.generateGridNames(rows, cols);

				this.updateDivs(rows, cols);

				let holderDivs = gridElement.querySelectorAll('div.HolderDiv') as unknown as HTMLDivElement[];

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
	/**
	 * Update the number of slots
	 * @param  {Number} rows    Number of rows to have
	 * @param  {Number} columns Number of columns to have
	 */
	updateDivs (rows: number, columns: number) {
		let insertionPoint = this.shadowRoot.querySelector('#gridHolder') as HTMLDivElement;
		let current = insertionPoint.childElementCount;
		let template = this.shadowRoot.querySelector('#templateHolderDiv') as HTMLTemplateElement;
		let slots = insertionPoint.querySelectorAll('slot');
		let amount = rows * columns;
		if (this.coordnaming) {
			let currentRow = 1;
			let currentCol = 1;
			let next = () => {
				currentCol += 1;
				if (currentCol > columns) {
					currentCol = 1;
					currentRow += 1;
				}
			};
			for (let slot of slots) {
				slot.name = currentRow.toString() + '-' + currentCol.toString();
				next();
			}
			for (let count = current; count <= amount; count++) {
				let newDiv = document.importNode(template, true);
				let div = newDiv.content.querySelector('div.HolderDiv') as HTMLDivElement;
				let slot = newDiv.content.querySelector('slot.link') as HTMLSlotElement;

				div.style.gridArea = Grid.numToCharCode(count + 1);
				slot.name = currentRow.toString() + '-' + currentCol.toString();
				insertionPoint.appendChild(newDiv.content);
				next();
			}
		} else {
			let count = 0;
			for (; count < current; count++) {
				slots[count].name = 's' + (count + 1).toString();
			}
			for (;count <= amount; count++) {
				let newDiv = document.importNode(template, true);
				let div = newDiv.content.querySelector('div.HolderDiv') as HTMLDivElement;
				let slot = newDiv.content.querySelector('slot.link') as HTMLSlotElement;

				div.style.gridArea = Grid.numToCharCode(count);
				slot.name = 's' + (count + 1).toString();
				insertionPoint.appendChild(newDiv.content);
			}
		}
	}

	/**
	 * Generate areas for the template
	 * @param  {Number} rows    Number of rows to make
	 * @param  {Number} columns Number of columns to make
	 * @return {String}         templateAreas
	 */
	static generateGridNames (rows: number, columns: number): string {
		let i = 0;
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
	/**
	 * Convert a number to an alphabetic code
	 * @param  {Number} num Number to convert
	 * @return {String}     Base 26 encoding
	 */
	static numToCharCode (num: number): string {
                const base = 26;
        	const a_point = 0x61;
        	let result = [];
        	{
        		let mod = num % base;
        		result.push(mod + a_point);
        		num -= mod;
        		num /= base;
        	}
        	while (num != 0) {
        		num -= 1;
        		let mod = num % base;
        		result.push(mod + a_point);
        		num -= mod;
        		num /= base;
        	}

        	result.reverse();
        	return String.fromCodePoint(...result);
	}

};

export default Grid;

Elements.elements.Grid = Grid;

Elements.load(Grid, 'elements-grid');
