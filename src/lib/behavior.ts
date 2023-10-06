import type { Component } from './component';

export abstract class Behavior<T extends object = object> {
	public options: T;

	constructor(options: Partial<T> = {}) {
		this.options = {
			...this.defaultOptions(),
			...options
		} as T;
	}

	protected abstract defaultOptions(): T;

	public init(component: Component): void {
		String(component);
	}

	public destroy(component: Component): void {
		String(component);
	}
}
