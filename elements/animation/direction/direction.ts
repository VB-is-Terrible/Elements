import {backbone4, setUpAttrPropertyLink} from '../../elements_backbone.js';
import {} from '../../elements_helper.js';

export const enum Direction_Vertical {
	off = 0,
	up = -1,
	down = 1,
};

export const enum Direction_Horizontal {
	off = 0,
	right = 1,
	left = -1,
};


export const vertical = Symbol('animation vertical');
export const horizontal = Symbol('animation horizontal');

/**
 * [AnimationDirection Description]
 * @augments Elements.elements.backbone4
 * @memberof Elements.elements
 */
export abstract class AnimationDirection extends backbone4 {
	[vertical]: Direction_Vertical = Direction_Vertical.off;
	[horizontal]: Direction_Horizontal = Direction_Horizontal.off;
	vertical!: string;
	horizontal!: string;
	abstract toggled: boolean;
	constructor() {
		super();
	}
	protected _post_init() {
		setUpAttrPropertyLink(this, 'vertical', '', (value: string) => {
			switch (value) {
				case 'up':
					this[vertical] = Direction_Vertical.up;
					break;
				case 'down':
					this[vertical] = Direction_Vertical.down;
					break;
				case '':
				default:
					this[vertical] = Direction_Vertical.off;
			}
			this.direction_change();
		});
		setUpAttrPropertyLink(this, 'horizontal', '', (value: string) => {
			switch (value) {
				case 'right':
					this[horizontal] = Direction_Horizontal.right;
					break;
				case 'left':
					this[horizontal] = Direction_Horizontal.left;
					break;
				case '':
				default:
					this[horizontal] = Direction_Horizontal.off;
			}
			this.direction_change();
		});
	}
	static get observedAttributes() {
		return ['vertical', 'horizontal', 'toggled'];
	}
	protected abstract direction_change(): void;
}

export default AnimationDirection;
