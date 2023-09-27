import { html } from './util';

type ComponentCtor = { new (...args: unknown[]): Component; componentId: string; owner: () => HTMLElementWithMetaData };

type HTMLElementWithMetaData = HTMLElement & { __component: Component };

function collectIds<T extends ComponentCtor>(ctor: T): string[] {
	const ids: string[] = [];
	let currentCtor: ComponentCtor = ctor;
  
	while (currentCtor) {
	  if (currentCtor.componentId) {
		ids.unshift(currentCtor.componentId);
	  }

	  const newCtor = Object.getPrototypeOf(currentCtor);

	  if (currentCtor as unknown === Component) {
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
	private _styles: Partial<CSSStyleDeclaration> = {};

	static componentId = 'component';

	public static owner(view: HTMLElement): Component | null {
		if ('__component' in view && view.__component instanceof Component) {
			return view.__component;
		}
		return null
	}

	constructor(model?: M) {
		this._id = collectIds(this.constructor as ComponentCtor);

		this.model = model ?? this.defaults();
		this.view = this.createView();

		this.initView();
		this.onModelReset();
		this.updateView();
		this.init();
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
		(view as unknown as HTMLElementWithMetaData).__component = this;
	}

	protected onModelReset(): void {
		// override
	}

	protected updateView(): void {
		// override
	}

	protected init() {
		// override
	}

	public get value() {
		return this.model;
	}

	public set value(value: M) {
		this.model = value;
		this.onModelReset();
		this.updateView();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public on<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    public on(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
		return this.view.addEventListener(type, listener, options);
	}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public off<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    public off(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
		return this.view.removeEventListener(type, listener, options);
	}

	public style(styles: Partial<CSSStyleDeclaration>) {
		this._styles = {...this._styles, ...styles};
		Object.assign(this.view.style, styles);
	}

	public hasStyle(key: keyof CSSStyleDeclaration, value?: string) {
		return key in this._styles && (value === undefined || this._styles[key] === value);
	}

	public clearStyle(key?: keyof CSSStyleDeclaration) {
		if (key) {
			this.view.style.removeProperty(String(key));
			delete this._styles[key];
			return;
		}
		for (const key of Object.keys(this._styles)) {
			this.view.style.removeProperty(key);
		}
		this._styles = {};
	}
}
