import type { Control, ControlEvent, ControlEventHandler } from './control';
import { uniqueId } from './util';


export abstract class Behavior<
	OptionsType extends object = object, 
	EventsType extends string = string
> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static instances: Record<string, any> = {};

	public static id: string;

	private _component: Control | null = null;
	protected _behaviors: Behavior[] = [];
	public options: OptionsType;
	public readonly _uid = uniqueId();

	constructor(options: Partial<OptionsType> = {}) {
		this.options = {
			...this.defaultOptions(),
			...options
		} as OptionsType;
	}

	public get id() {
		return (this.constructor as unknown as {id:string}).id;
	}

	protected defaultOptions(): OptionsType {
		return {} as OptionsType;
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
		component.on('propsChanged', this.onModelChanged);
		component.on('rendered', this.onRendered);
		this.install();
	}

	public dispose(): void {
		const { component } = this;
		component.off('propsChanged', this.onModelChanged);
		component.off('rendered', this.onRendered);
		this.uninstall();
		this._component = null;
		this.options = {} as OptionsType;
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

	public on(eventName: EventsType, handler: ControlEventHandler): this {
		this.component.on(eventName as ControlEvent, handler);
		return this;
	}

	public off(eventName: EventsType, handler: ControlEventHandler): this {
		this.component.off(eventName as ControlEvent, handler);
		return this;
	}

	protected emit(eventName: EventsType, detail?: unknown): this {
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

	public addBehavior(behavior: Behavior, id?: string) {
		this._behaviors.push(behavior);
		return this.component.addBehavior(behavior, id);
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
