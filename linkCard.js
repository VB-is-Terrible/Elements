'use strict'

let ElementsCardLinkHolderProto = Object.create(HTMLElement.prototype);

ElementsCardLinkHolderProto.createdCallback = function () {
      let shadow = this.createShadowRoot();
      let template = document.importNode(
         document.querySelector('#templateElementsCardLinkHolder'),
         true);
}

let ElementsCardLinkHolder = document.registerElement('Elements-CardLinkHolder', {
    prototype: ElementsCardLinkHolderProto
});



let ElementsCardLinkProto = Object.create(HTMLElement.prototype);

ElementsCardLinkProto.createdCallback = function () {
      let shadow = this.createShadowRoot();
      let template = document.importNode(
         document.querySelector('#templateElementsLinkCard'),
         true);
}

let ElementsCardLink = document.registerElement('Elements-LinkCard', {
    prototype: ElementsCardLinkProto
});
