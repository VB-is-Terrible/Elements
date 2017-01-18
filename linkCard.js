'use strict'

// Elements Bootloader
if (!Elements) {
	window.Elements = {}
}

Elements.checkInitProperty = (object, property, default = '') => {
	if (object[property] !== undefined && object[property] !== '') {
		return object[property];
	} else {
		return default;
	}
};

Elements.CardLinkHolderProto = Object.create(HTMLElement.prototype);

Elements.CardLinkHolderProto.createdCallback = function () {
      let shadow = this.createShadowRoot();
      let template = document.importNode(
         document.querySelector('#templateElementsCardLinkHolder'),
         true);
		shadow.appendChild(template.content)
}

let Elements.CardLinkHolder = document.registerElement('Elements-CardLinkHolder', {
    prototype: Elements.CardLinkHolderProto
});



let Elements.CardLinkProto = Object.create(HTMLElement.prototype);

Elements.CardLinkProto.createdCallback = function () {
      let shadow = this.createShadowRoot();
      let template = document.importNode(
         document.querySelector('#templateElementsLinkCard'),
         true);

		let imgPath = Elements.checkInitProperty(this, 'src', '');

		let title = Elements.checkInitProperty(this, 'title', '');

		let faviconImg = template.content.querySelector('#faviconImg');
		let thumbImg = template.content.querySelector('#thumbImg');
		let titleSpan = template.content.querySelector('#titleSpan');

		
		shadow.appendChild(template.content)
};

let Elements.CardLink = document.registerElement('Elements-LinkCard', {
    prototype: Elements.CardLinkProto
});
