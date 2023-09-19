export function html<T extends HTMLElement>(htmlStr: string): T {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlStr, 'text/html');
	const element = doc.body.firstChild as T;

	if (element === null) {
		throw new Error('Could not parse HTML');
	}

	return element;
}

export type Writable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };
