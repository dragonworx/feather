export function html<T extends HTMLElement>(htmlStr: string): T {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlStr, 'text/html');
	const element = doc.body.firstChild as T;

	if (element === null) {
		throw new Error('Could not parse HTML');
	}

	return element;
}
