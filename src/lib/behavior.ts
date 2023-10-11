import EventEmitter from 'eventemitter3';
import type { Component } from './component';

export abstract class Behavior<
	T extends object = object,
	E extends EventEmitter.ValidEventTypes = string
> {
	public options: T;
	protected emitter: EventEmitter;

	constructor(options: Partial<T> = {}) {
		this.options = {
			...this.defaultOptions(),
			...options
		} as T;
		this.emitter = new EventEmitter();
	}

	protected abstract defaultOptions(): T;

	public init(component: Component): void {
		String(component);
	}

	public destroy(component: Component): void {
		String(component);
	}

	public on(eventName: E, handler: EventEmitter.ListenerFn, context?: unknown): void {
		this.emitter.on(String(eventName), handler, context);
	}

	public off(eventName: E, handler?: EventEmitter.ListenerFn, context?: unknown): void {
		this.emitter.off(String(eventName), handler, context);
	}

	public emit(eventName: E, ...args: unknown[]): void {
		this.emitter.emit(String(eventName), ...args);
	}
}
