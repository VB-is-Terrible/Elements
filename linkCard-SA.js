const BUILDER = "		<template id=\"templateElementsLinkCardLink\">" +
"			<style>" +
"				#faviconImg {" +
"					height: var(--HeaderHeight);" +
"					width: var(--HeaderHeight);" +
"					grid-area: favicon;" +
"				}" +
"				#titleSpan {" +
"					font-size: calc(var(--HeaderHeight) * .8);" +
"					text-overflow: clip;" +
"					color: initial;" +
"					overflow: hidden;" +
"					grid-area: title;" +
"					width: calc(100%);" +
"					/* 1ex Prevents text overflow when the padding is small */" +
"				}" +
"				#contentDiv {" +
"					display: grid;" +
"					grid-template-columns: [c0] var(--HeaderHeight) [c1] calc(100% - var(--HeaderHeight) - var(--ColGap)) [c2];" +
"					grid-template-rows: [r0] var(--HeaderHeight) [r1] 1fr [r2];" +
"					grid-template-areas: \"favicon title\"" +
"												\"image image\";" +
"					grid-auto-flow: row;" +
"					grid-row-gap: var(--RowGap);" +
"					grid-column-gap: var(--ColGap);" +
"					height: 100%;" +
"					width: 100%;" +
"					box-sizing: border-box;" +
"				}" +
"				#pseudoBody {" +
"					overflow: hidden;" +
"					max-width: var(--width);" +
"					max-height: var(--height);" +
"					--HeaderHeight: calc((var(--width) - 2 * var(--Margin)) / 130 * 20);" +
"					@apply --border-mixin;" +
"					padding: var(--Margin);" +
"					background-color: var(--background-color);" +
"					box-sizing: border-box;" +
"				}" +
"				:host {" +
"					--RowGap: 10px;" +
"					--ColGap: 10px;" +
"					--Margin: 5px;" +
"					--width: 130px;" +
"					--height: calc(var(--width) + 2 * var(--Margin));" +
"					--background-color: white;" +
"					--border-mixin: {" +
"						border-width: 1px;" +
"						border-style: solid;" +
"						border-radius: 5px;" +
"						border-color: black;" +
"					};" +
"				}" +
"				#CardLink {" +
"					text-decoration: none;" +
"				}" +
"				#thumbImg {" +
"					width: calc(100%);" +
"					height: calc(100%);" +
"					grid-area: image;" +
"					/* -  var(--RowGap)*/" +
"					/*background: turquoise;*/" +
"				}" +
"			</style>" +
"			<div id=\"pseudoBody\">" +
"				<a id=\"CardLink\">" +
"" +
"					<div id=\"contentDiv\">" +
"						<img id=\"faviconImg\" src = \"drive.png\">" +
"						<span id=\"titleSpan\">" +
"							You should not be seeing this" +
"						</span>" +
"						<img id=\"thumbImg\" src = \"TCF.png\">" +
"					</div>" +
"				</a>" +
"			</div>" +
"		</template>";

// a = document.createDocumentFragment(BUILDER);
document.write(BUILDER);


Elements.elements.LinkCardLink = class extends Elements.elements.backbone {
	constructor () {
		super();
		let shadow = this.attachShadow({ mode: 'open' });
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