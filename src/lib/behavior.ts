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

	constructor(options: Partial<T> = {}) {
		this.options = {
			...this.defaultOptions(),
			...options
		} as T;
		this.emitter = new EventEmitter();
	}

	protected defaultOptions(): T {
		return {} as T;
	}

	protected get component(): Component {
		if (!this._component) {
			throw new Error('Component not initialized');
		}
		return this._component;
	}

	public init(component: Component): void {
		this._component = component;
		this.install();
	}

	protected install() {
		// override
	}
	protected uninstall() {
		// override
	}

	public dispose(): void {
		this.uninstall();
		this._component = null;
		this.options = {} as T;
		this.tag = '';
		this.emitter.removeAllListeners();
	}

	public on(eventName: E, handler: EventEmitter.ListenerFn, context?: unknown): this {
		this.emitter.on(String(eventName), handler, context);
		return this;
	}

	public off(eventName: E, handler?: EventEmitter.ListenerFn, context?: unknown): this {
		this.emitter.off(String(eventName), handler, context);
		return this;
	}

	public emit(eventName: E, ...args: unknown[]): this {
		this.emitter.emit(String(eventName), ...args);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onModelChanged(value: unknown, oldValue: unknown): void {
		String(value);
		String(oldValue);
		// override
	}

	public onElementUpdated() {
		// override
	}
}
