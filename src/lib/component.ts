import { html } from './util';

export type Constructor<T extends Component> = new (...args: unknown[]) => T;

export abstract class Component<M = unknown, V extends HTMLElement = HTMLElement> {
	public readonly view: V;
	protected model: M;

	constructor(model?: M) {
		this.model = model ?? this.defaults();
		this.view = this.createView();
		this.initFromModel();
		this.updateView();
	}

	protected abstract defaults(): M;

	public template(): string {
		return '<div></div>';
	}

	protected createView(): V {
		return html(this.template());
	}

	protected initFromModel(): void {
		// override
	}

	protected updateView(): void {
		// override
	}

	public get value() {
		return this.model;
	}

	public set value(value: M) {
		this.model = value;
		this.updateView();
	}
}
