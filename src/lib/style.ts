export type CSSRules = Partial<{
	[selector in keyof CSSStyleDeclaration]: string | number;
}>;

export type CSSObject = {
	selector: string;
	rules: CSSRules;
	children?: CSSObject[];
};

export function css(selector: string, rules: CSSRules, ...children: CSSObject[]): CSSObject {
	return {
		selector,
		rules,
		children: children.length ? children : undefined
	};
}

function flattenCSS(selector: string, cssObject: CSSObject, cssStrings: string[]): void {
	let ruleSet = '';
	for (const [property, value] of Object.entries(cssObject.rules)) {
		ruleSet += `${property}: ${value}; `;
	}
	cssStrings.push(`${selector} { ${ruleSet} }`);

	if (cssObject.children) {
		for (const child of cssObject.children) {
			flattenCSS(`${selector} ${child.selector}`, child, cssStrings);
		}
	}
}

export function generateStyleSheet(cssObject: CSSObject, rootSelector: string): void {
	const cssStrings: string[] = [];
	flattenCSS(rootSelector, cssObject, cssStrings);

	const styleElement = document.createElement('style');
	styleElement.type = 'text/css';
	styleElement.innerHTML = cssStrings.join('\n');
	document.head.appendChild(styleElement);
}
