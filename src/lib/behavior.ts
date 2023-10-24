import type { ControlEvent, Control, ControlEventHandler } from './control';
import { uniqueId } from './util';

export abstract class Behavior<T extends object = object, E extends string = string> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static instances: Record<string, any> = {};

	private _component: Control | null = null;
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

	public get component(): Control {
		if (!this._component) {
			throw new Error('Component not initialized');
		}
		return this._component;
	}

	public get element(): HTMLElement {
		return this.component.element;
	}

	public init(component: Control): void {
		this._component = component;
		component.on<ControlEvent>('modelUpdated', this.onModelChanged);
		component.on<ControlEvent>('rendered', this.onRendered);
		this.install();
	}

	public dispose(): void {
		const { component } = this;
		component.off<ControlEvent>('modelUpdated', this.onModelChanged);
		component.off<ControlEvent>('rendered', this.onRendered);
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
	}) as ControlEventHandler;

	protected onRendered = () => {
		// override
	};

	public addBehavior(behavior: Behavior) {
		this._behaviors.push(behavior);
		return this.component.addBehavior(behavior);
	}

	public removeBehavior(behavior: Behavior): Behavior {
		const b = this.component.removeBehavior(behavior);
		if (!this._behaviors.includes(b)) {
			throw new Error('Behavior not found');
		}
		this._behaviors.splice(this._behaviors.indexOf(b), 1);
		return b;
	}
}
