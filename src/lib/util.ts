import { type ControlCtor, type ControlDescriptor, Control } from './control';

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

const _controlIds = new Set<string>();
const _validatedControls = new Set<ControlCtor>();

export function getDescriptors<T extends ControlCtor>(ctor: T): ControlDescriptor<object>[] {
	const descriptors: ControlDescriptor<object>[] = [];
	let currentCtor: ControlCtor = ctor;

	// walk up prototype chain and collect descriptors
	while (currentCtor) {
		if (currentCtor.descriptor) {
			descriptors.unshift(currentCtor.descriptor);
		}

		const newCtor = Object.getPrototypeOf(currentCtor) as ControlCtor;

		if ((currentCtor as unknown) === Control) {
			break;
		}

		currentCtor = newCtor;
	}

	// check that all descriptors in array have unique ids
	const ids = new Set<string>();

	for (const descriptor of descriptors) {
		if (ids.has(descriptor.id)) {
			throw new Error(`duplicate control descriptor id '${descriptor.id}'`);
		}
		ids.add(descriptor.id);
	}

	// check control id is unique
	if (!_validatedControls.has(ctor)) {
		const topDescriptor = descriptors[descriptors.length - 1];
		if (_controlIds.has(topDescriptor.id)) {
			throw new Error(`duplicate control id '${topDescriptor.id}'`);
		}
		_controlIds.add(topDescriptor.id);
	}

	// add to validated controls so we don't have to validate again
	_validatedControls.add(ctor);

	return descriptors;
}