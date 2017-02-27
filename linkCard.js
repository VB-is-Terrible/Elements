'use strict'


// Elements.LinkCardContainerProto = Object.create(HTMLElement.prototype);
//
// Elements.LinkCardContainerProto.createdCallback = function () {
//    let shadow = this.createShadowRoot();
//    let template = document.importNode(
//       document.querySelector('#templateElementsLinkCardContainer'),
//       true);
// 	shadow.appendChild(template.content)
// }
//
// Elements.SideLinkBox = document.registerElement('elements-LinkCardContainer', {
//     prototype: Elements.LinkCardContainerProto
// });

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

//
// Elements.CardLinkProto = Object.create(HTMLElement.prototype);
//
// Elements.CardLinkProto.createdCallback = function () {
// 	let shadow = this.createShadowRoot();
// 	let template = document.importNode(
// 	   document.querySelector('#templateElementsLinkCard'),
// 	   true);
//
// 	this.getDict = {};
// 	this.setDict = {};
//
// 	let faviconSet = false;
// 	let thumbSet = false;
//
// 	let faviconPath = Elements.checkInitProperty(this, 'favicon', null);
// 	let title = Elements.checkInitProperty(this, 'title', '');
// 	let link = Elements.checkInitProperty(this, 'href', 'about:blank');
// 	let thumbPath = Elements.checkInitProperty(this, 'src', null);
//
// 	if (faviconPath !== null) {
// 		faviconSet = true;
// 	}
//
// 	if (thumbPath !== null) {
// 		thumbSet = true;
// 	}
//
// 	if (faviconSet && !thumbSet) {
// 		thumbPath = faviconPath;
// 	} else if (!faviconSet && thumbSet) {
// 		faviconPath = thumbPath;
// 	}
//
// 	let faviconImg = template.content.querySelector('#faviconImg');
// 	let thumbImg = template.content.querySelector('#thumbImg');
// 	let titleSpan = template.content.querySelector('#titleSpan');
// 	let linkElem = template.content.querySelector('#CardLink');
//
// 	let faviconChange = (value) => {
// 		faviconImg.src = value;
// 	};
//
// 	let thumbChange = (value) => {
// 		thumbImg.src = value;
// 	};
//
// 	let titleChange = (value) => {
// 		if (!(value === null || value === undefined)) {
// 			titleSpan.textContent = value;
// 		}
// 	};
//
// 	let linkChange = (value) => {
// 		linkElem.href = value;
// 	};
//
// 	Elements.setUpAttrPropertyLink(this, 'favicon', faviconPath, faviconChange);
// 	Elements.setUpAttrPropertyLink(this, 'title', title, titleChange);
// 	Elements.setUpAttrPropertyLink(this, 'href', link, linkChange);
// 	Elements.setUpAttrPropertyLink(this, 'src', thumbPath, thumbChange);
//
// 	shadow.appendChild(template.content)
// };
//
// Elements.CardLinkProto.attributeChangedCallback = function (
// 	attrName, oldValue, newValue) {
// 	if (attrName in this.setDict) {
// 		this.setDict[attrName](newValue);
// 	}
// };
//
// Elements.CardLink = document.registerElement('elements-linkcard', {
//     prototype: Elements.CardLinkProto
// });
//

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

      shadow.appendChild(template.content)

	}
};


window.customElements.define('elements-linkcard-linkcontainer', Elements.LinkCardHolder);
