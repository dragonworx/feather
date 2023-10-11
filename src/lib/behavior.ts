import EventEmitter from 'eventemitter3';
import type { Component } from './component';

export abstract class Behavior<
	T extends object = object,
	E extends EventEmitter.ValidEventTypes = string
> {
	public options: T;
	protected emitter: EventEmitter;
	public tag: string = '';
	protected _component: Component | null = null;

	constructor(options: Partial<T> = {}, tag?: string) {
		this.options = {
			...this.defaultOptions(),
			...options
		} as T;
		this.emitter = new EventEmitter();
		this.tag = tag ?? '';
	}

	protected abstract defaultOptions(): T;

	protected get component(): Component {
		if (!this._component) {
			throw new Error('Component not initialized');
		}
		return this._component;
	}

	public init(component: Component): void {
		this._component = component;
	}

	public destroy(): void {
		this._component = null;
		this.options = {} as T;
		this.tag = '';
		this.emitter.removeAllListeners();
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
