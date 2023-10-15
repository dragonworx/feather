import type { ComponentEvent, Component, ComponentEventHandler } from './component';
import { uniqueId } from './util';

export abstract class Behavior<T extends object = object, E extends string = string> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static instances: Record<string, any> = {};

	private _component: Component | null = null;
	protected _behaviors: Behavior[] = [];
	public options: T;
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

	public get component(): Component {
		if (!this._component) {
			throw new Error('Component not initialized');
		}
		return this._component;
	}

	public init(component: Component): void {
		this._component = component;
		component.on<ComponentEvent>('modelUpdated', this.onModelChanged);
		component.on<ComponentEvent>('elementUpdated', this.onElementUpdated);
		this.install();
	}

	public dispose(): void {
		const { component } = this;
		component.off<ComponentEvent>('modelUpdated', this.onModelChanged);
		component.off<ComponentEvent>('elementUpdated', this.onElementUpdated);
		this.uninstall();
		this._component = null;
		this.options = {} as T;
		for (const behavior of this._behaviors) {
			behavior.dispose();
		}
		this._behaviors.length = 0;
	}

	protected install() {
		// override
	}
	protected uninstall() {
		// override
	}

	protected emit(eventName: E, detail?: unknown): this {
		this.component.emit(eventName, detail);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onModelChanged = ((value: unknown, oldValue: unknown): void => {
		String(value);
		String(oldValue);
		// override
	}) as ComponentEventHandler;

	protected onElementUpdated = () => {
		// override
	};

	public addBehavior(behavior: Behavior) {
		this._behaviors.push(behavior);
		return this.component.addBehavior(behavior);
	}

	public removeBehavior<T extends Behavior>(behavior: Behavior | (new () => T)): Behavior {
		const b = this.component.removeBehavior(behavior);
		if (b) {
			this._behaviors.splice(this._behaviors.indexOf(b), 1);
		}
		return b;
	}
}
