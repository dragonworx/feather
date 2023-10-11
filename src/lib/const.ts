import { Component } from './component';

export type ComponentCtor = {
	new (...args: unknown[]): Component;
	componentId: string;
	owner: () => HTMLElementWithMetaData;
};

export type HTMLElementWithMetaData = HTMLElement & { __feather_component: Component };

export function collectIds<T extends ComponentCtor>(ctor: T): string[] {
	const ids: string[] = [];
	let currentCtor: ComponentCtor = ctor;

	while (currentCtor) {
		if (currentCtor.componentId) {
			ids.unshift(currentCtor.componentId);
		}

		const newCtor = Object.getPrototypeOf(currentCtor);

		if ((currentCtor as unknown) === Component) {
			break;
		}

		if (newCtor.id === currentCtor.componentId) {
			throw new Error(`${currentCtor.name} is missing static "id" property`);
		}

		currentCtor = newCtor;
	}

	return ids;
}
