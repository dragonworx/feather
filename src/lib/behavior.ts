import EventEmitter from 'eventemitter3';
import type { Component } from './component';
import { uniqueId } from './util';

export interface BehaviorEvent<T = unknown> {
	behavior: Behavior;
	data?: T;
}

export abstract class Behavior<
	T extends object = object,
	E extends EventEmitter.ValidEventTypes = string
> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static instances: Record<string, any> = {};

	private _component: Component | null = null;
	protected _behaviors: Behavior[] = [];
	protected emitter: EventEmitter = new EventEmitter();
	public options: T;
	public tag: string = '';
	public readonly _uid = uniqueId();

	constructor(options: Partial<T> = {}) {
		this.options = {
			...this.defaultOptions(),
			...options
		} as T;
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
		for (const behavior of this._behaviors) {
			behavior.dispose();
		}
		this._behaviors.length = 0;
	}

	public on(eventName: E, handler: EventEmitter.ListenerFn, context?: unknown): this {
		this.emitter.on(String(eventName), handler, context);
		return this;
	}

	public off(eventName: E, handler?: EventEmitter.ListenerFn, context?: unknown): this {
		this.emitter.off(String(eventName), handler, context);
		return this;
	}

	public emit(eventName: E, data?: unknown): this {
		const event: BehaviorEvent = {
			behavior: this as unknown as Behavior,
			data
		};
		this.emitter.emit(String(eventName), event);
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

	public behavior<B extends Behavior | undefined, T extends string = string>(tag: T): B {
		return this._behaviors.find((behavior) => behavior.tag === tag) as B;
	}

	public behaviors<B extends Behavior | undefined, T extends string = string>(tag: T): B[] {
		return this._behaviors.filter((behavior) => behavior.tag === tag) as B[];
	}

	public addBehavior<T extends string = string>(tag: T, behavior: Behavior) {
		this._behaviors.push(behavior);
		return this.component.addBehavior(tag, behavior);
	}

	public removeBehavior<T extends string = string>(behavior: Behavior | T) {
		const b = this.component.removeBehavior(behavior);
		if (b) {
			this._behaviors.splice(this._behaviors.indexOf(b), 1);
		}
		return b;
	}
}
