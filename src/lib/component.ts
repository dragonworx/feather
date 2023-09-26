import { html } from './util';

type ComponentCtor = { new (...args: unknown[]): Component; componentId: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectIds<T extends ComponentCtor>(ctor: T): string[] {
	const ids: string[] = [];
	let currentCtor: ComponentCtor = ctor;
  
	while (currentCtor) {
	  if (currentCtor.componentId) {
		ids.unshift(currentCtor.componentId);
	  }
	  const newCtor = Object.getPrototypeOf(currentCtor);
	  if (currentCtor === Component) {
		break;
	  }
	  if (newCtor.id === currentCtor.componentId) {
		throw new Error(`${currentCtor.name} is missing static "id" property`);
	  }
	  currentCtor = newCtor;
	}
  
	return ids;
  }

export abstract class Component<M = unknown, V extends HTMLElement = HTMLElement> {
	public readonly view: V;
	protected model: M;
	private _id: string[];

	static componentId = 'component';

	constructor(model?: M) {
		this._id = collectIds(this.constructor as ComponentCtor);

		this.model = model ?? this.defaults();
		this.view = this.createView();

		this.initView();
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

	protected initView(): void {
		const {view, _id} = this;
		view.classList.add(..._id);
		view.setAttribute('data-component', _id[_id.length - 1]);
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
