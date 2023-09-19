import { html, type Writable } from './util';

export abstract class Component<M = unknown, V extends HTMLElement = HTMLDivElement> {
	public readonly view: V;
	public readonly model: M;

	constructor(model?: M, view?: V) {
		this.model = model ?? this.defaults();
		this.view = view ?? this.createView();

		this.value = this.model;
	}

	protected abstract defaults(): M;
	public static template(): string {
		return '<div></div>';
	}

	protected createView(): V {
		return html((this.constructor as typeof Component).template());
	}

	protected updateView(): void {
		// subclasses should override this method 
		// to update the view from the model
	}

	protected initFromModel() {
		// subclasses can override this method to initialize children from the model
		// they can choose how to optimise this, for example list
	}

	public get value() {
		return this.model;
	}

	public set value(value: M) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const writableThis: Writable<Component<M, V>, 'model'> = this;

		writableThis.model = value;
		this.initFromModel();
		this.updateView();
	}
}
