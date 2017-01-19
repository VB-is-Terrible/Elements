'use strict'

// Elements Bootloader
if (!("Elements" in window)) {
	window.Elements = {}
}

Elements.checkInitProperty = (object, property, value = '') => {
	if (object[property] !== undefined && object[property] !== '') {
		return object[property];
	} else if (object.getAttribute(property) !== null) {
		return object.getAttribute(property);
	} else {
		return value;
	}
};

/* Sets up hidden property, setters, getters, hooks to attribute modifications
 * Takes care of standard plumbing required to make HTMLElement like properties
 */
Elements.setUpAttrPropertyLink = (object, property, inital=null, extra = ()=>{}) => {
	let hidden;
	let getter = () => {return hidden;};
	let setter = (value) => {
		hidden = value;
		object.setAttribute(property, value);
		extra(value);
	};

	Object.defineProperty(object, property, {
		enumerable: true,
		configurable: true,
		get: getter,
		set: setter
	});

	object.getDict[property] = getter;
	object.setDict[property] = setter;

	setter(inital);

	return {
		get: getter,
		set: setter
	};
};


Elements.CardLinkHolderProto = Object.create(HTMLElement.prototype);

Elements.CardLinkHolderProto.createdCallback = function () {
   let shadow = this.createShadowRoot();
   let template = document.importNode(
      document.querySelector('#templateElementsCardLinkHolder'),
      true);
	shadow.appendChild(template.content)
}

Elements.CardLinkHolder = document.registerElement('Elements-CardLinkHolder', {
    prototype: Elements.CardLinkHolderProto
});



Elements.CardLinkProto = Object.create(HTMLElement.prototype);

Elements.CardLinkProto.createdCallback = function () {
	let shadow = this.createShadowRoot();
	let template = document.importNode(
	   document.querySelector('#templateElementsLinkCard'),
	   true);

	this.getDict = {};
	this.setDict = {};

	let faviconSet = false;
	let thumbSet = false;

	let faviconPath = Elements.checkInitProperty(this, 'favicon', null);
	let title = Elements.checkInitProperty(this, 'title', '');
	let link = Elements.checkInitProperty(this, 'href', 'about:blank');
	let thumbPath = Elements.checkInitProperty(this, 'src', null);

	if (faviconPath !== null) {
		faviconSet = true;
	}

	if (thumbPath !== null) {
		thumbSet = true;
	}

	if (faviconSet && !thumbSet) {
		thumbPath = faviconPath;
	} else if (!faviconSet && thumbSet) {
		faviconPath = thumbPath;
	}

	let faviconImg = template.content.querySelector('#faviconImg');
	let thumbImg = template.content.querySelector('#thumbImg');
	let titleSpan = template.content.querySelector('#titleSpan');
	let linkElem = template.content.querySelector('#CardLink');

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

	Elements.setUpAttrPropertyLink(this, 'favicon', faviconPath, faviconChange);
	Elements.setUpAttrPropertyLink(this, 'title', title, titleChange);
	Elements.setUpAttrPropertyLink(this, 'href', link, linkChange);
	Elements.setUpAttrPropertyLink(this, 'src', thumbPath, thumbChange);

	shadow.appendChild(template.content)
};

Elements.CardLinkProto.attributeChangedCallback = function (
	attrName, oldValue, newValue) {
	if (attrName in this.setDict) {
		this.setDict[attrName](newValue);
	}
};

Elements.CardLink = document.registerElement('Elements-LinkCard', {
    prototype: Elements.CardLinkProto
});
