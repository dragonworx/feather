import { type ComponentCtor, type ComponentDescriptor, Component } from './component';

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

export function asArray<T>(value: T | T[]) {
	return Array.isArray(value) ? value : [value];
}

let _id = 0;

export function uniqueId() {
	return `${++_id}`;
}

export function getDescriptors<T extends ComponentCtor>(ctor: T): ComponentDescriptor<object>[] {
	const descriptors: ComponentDescriptor<object>[] = [];
	let currentCtor: ComponentCtor = ctor;

	// walk up prototype chain and collect descriptors
	while (currentCtor) {
		if (currentCtor.descriptor) {
			descriptors.unshift(currentCtor.descriptor);
		}

		const newCtor = Object.getPrototypeOf(currentCtor) as ComponentCtor;

		if ((currentCtor as unknown) === Component) {
			break;
		}

		currentCtor = newCtor;
	}

	// check that all descriptors in array have unique ids
	const ids = new Set<string>();

	for (const descriptor of descriptors) {
		if (ids.has(descriptor.id)) {
			throw new Error(`duplicate component descriptor id '${descriptor.id}'`);
		}
		ids.add(descriptor.id);
	}

	return descriptors;
}