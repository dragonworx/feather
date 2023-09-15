export abstract class Component<V extends HTMLElement, M = unknown> {
	public readonly view: V;
	protected model: M;

	constructor(model?: M) {
		this.model = model ?? this.defaultModel();
		this.view = this.createView();
		this.updateView();
	}

	protected abstract defaultModel(): M;
	protected abstract createView(): V;
	protected abstract updateView(): void;

	public get value() {
		return this.model;
	}

	public set value(value: M) {
		this.model = value;
		this.updateView();
	}
}
