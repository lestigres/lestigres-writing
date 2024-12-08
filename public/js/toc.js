export class TableOfContents extends HTMLElement {
	static register() {
		if ("customElements" in window) {
			customElements.define("table-of-contents", TableOfContents);
		}
	}

	static get observedAttributes() {
		return ["for"];
	}

	constructor() {
		super();

		if (!this.for) return;

		this.innerHTML = `
	<h2 id="toc" style="margin-block-start: 2rem">Table of Contents</h2>
	<nav aria-labelledby="toc" style="margin-block-end: 2rem"></nav>
`;
		const list = buildAbstractList(this.headings);
		const tree = buildAbstractTree(list);
		const ol = renderTocTree(tree);
		this.nav.replaceChildren(ol);
	}

	connectedCallback() {}

	get for() {
		return this.getAttribute("for");
	}

	get nav() {
		return this.querySelector("nav[aria-labelledby]");
	}

	get headings() {
		return document.querySelectorAll(`#${this.for} :is(h2, h3, h4, h5, h6)`);
	}
}
function getLevel(el) {
	return parseInt(el.nodeName[1]);
}
function buildAbstractList(headings) {
	return Array.from(headings).map((el) => ({
		id: el.id,
		level: getLevel(el),
		content: el.textContent,
	}));
}
function buildAbstractTree(list) {
	if (list.length === 0) return [];
	const lowest = list[0].level;
	const tree = [];
	for (const item of list) {
		[...Array(item.level - lowest).keys()]
			.reduce((cur) => children(last(cur)), tree)
			.push({ ...item });
	}
	return tree;
}
const last = (l) => l[l.length - 1];
const children = (t) => {
	if (t.children == null) t.children = [];
	return t.children;
};
function renderTocTree(tree, nested = false) {
	let list;
	if (nested) {
		list = document.createElement("ul");
	} else {
		list = document.createElement("ol");
		list.style.borderInlineStart = "0.3em solid var(--color-2)";
		list.style.paddingInlineStart = "2.5em";
	}
	tree.forEach((item) => {
		const listItem = document.createElement("li");
		listItem.dataset.level = item.level.toString();
		const a = document.createElement("a");
		a.href = `#${item.id}`;
		a.textContent = item.content;
		a.setAttribute("part", "anchor");
		listItem.appendChild(a);
		if (item.children != null) {
			listItem.appendChild(renderTocTree(item.children, true));
		}
		list.appendChild(listItem);
	});
	return list;
}

TableOfContents.register();
