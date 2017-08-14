'use strict'

Elements.elements.Kerbal = class extends Elements.elements.DragDown {
	constructor () {
		super();
		let kerbalTag = document.createElement('elements-kerbal-tag');
		kerbalTag.name = "Jeb";
		kerbalTag.text = "God";
		kerbalTag.setAttribute('slot', 's1');
		this.appendChild(kerbalTag);
		// let
		Elements.setUpAttrPropertyLink(this, 'name', 'Jobe', )
	}
}

Elements.load('', Elements.elements.Kerbal, 'elements-kerbal');
