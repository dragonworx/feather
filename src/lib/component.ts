/* eslint-disable @typescript-eslint/no-explicit-any */
import { collectIds, type ComponentCtor, type HTMLElementWithMetaData } from './const';
import type { Behavior } from './behavior';
import { asArray, html } from './util';
import { Cache } from './cache';

export abstract class Component<V extends HTMLElement = HTMLElement, M = undefined> {
	public readonly view: V;
	protected model: M;
	private _id: string[];
	private _styles: Partial<CSSStyleDeclaration> = {};
	private _classes: string[] = [];
	private _listeners: Map<string, EventListenerOrEventListenerObject[]> = new Map();
	private _plugins: Behavior[] = [];

	static componentId = 'component';

	public readonly cache: Cache<string, any> = new Cache();

	public static owner(source: Event | EventTarget | null): Component | null {
		const view = source instanceof Event ? source.target : source;
		if (view && '__component' in view && view.__component instanceof Component) {
			return view.__component;
		}
		return null;
	}

	constructor(model?: M) {
		this._id = collectIds(this.constructor as ComponentCtor);

		this.model = model ?? this.defaults();
		this.view = this.createView();

		this.initView();
		this.init();

		this.value = this.model;
	}

	protected abstract defaults(): M;

	public template(): string {
		return '<div></div>';
	}

	protected createView(): V {
		return html(this.template());
	}

	private initView(): void {
		const { view, _id } = this;
		view.classList.add(..._id);
		view.setAttribute('data-component', _id[_id.length - 1]);
		(view as unknown as HTMLElementWithMetaData).__component = this as unknown as Component;
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

	public asComponent() {
		return this as unknown as Component;
	}

	private getListeners(type: string) {
		if (!this._listeners.has(type)) {
			this._listeners.set(type, []);
		}
		return this._listeners.get(type)!;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public on<K extends string>(
		type: K | keyof HTMLElementEventMap,
		listener: (
			this: HTMLElement,
			ev: K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : any
		) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	public on(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void {
		this.getListeners(type).push(listener);
		this.view.addEventListener(type, listener, options);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public off<K extends string>(
		type: K | keyof HTMLElementEventMap,
		listener: (
			this: HTMLElement,
			ev: K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : any
		) => any,
		options?: boolean | AddEventListenerOptions
	): void;
	public off(
		type: string,
		listener?: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void {
		if (!this._listeners.has(type)) {
			return;
		}
		const listeners = this.getListeners(type);
		if (listener) {
			// remove listener
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
			if (listeners.length === 0) {
				this._listeners.delete(type);
			}
			this.view.removeEventListener(type, listener, options);
		} else {
			// remove all
			for (const l of listeners) {
				this.view.removeEventListener(type, l, options);
			}
			this._listeners.delete(type);
		}
	}

	public dispatch<K extends string>(type: K | keyof HTMLElementEventMap, detail?: any): void {
		this.view.dispatchEvent(
			new CustomEvent(type, {
				detail,
				bubbles: true,
				cancelable: true
			})
		);
	}

	public style(styles: Partial<CSSStyleDeclaration>) {
		this._styles = { ...this._styles, ...styles };
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

	public appendTo(parent: HTMLElement | Component) {
		(parent instanceof HTMLElement ? parent : parent.view).appendChild(this.view);
	}

	public hasClass<T extends string>(cssClass: T | T[]) {
		for (const cls of asArray(cssClass)) {
			if (this.view.classList.contains(cls)) {
				return true;
			}
		}
		return false;
	}

	public addClass<T extends string>(cssClass: T | T[]) {
		const { classList } = this.view;
		for (const cls of asArray(cssClass)) {
			if (classList.contains(cls)) {
				continue;
			}
			classList.add(cls);
			this._classes.push(cls);
		}
	}

	public removeClass<T extends string>(cssClass: T | T[]) {
		const { classList } = this.view;
		for (const cls of asArray(cssClass)) {
			if (classList.contains(cls)) {
				this._classes.splice(this._classes.indexOf(cls), 1);
				classList.remove(cls);
			}
		}
	}

	public clearClasses() {
		const { classList } = this.view;
		for (const cssClass of this._classes) {
			classList.remove(cssClass);
		}
		this._classes.length = 0;
	}

	public query<T extends HTMLElement>(cssSelector: string, useCache = true): T | null {
		if (!useCache) {
			return this.view.querySelector<T>(cssSelector);
		}
		const cacheElement = this.cache.get(cssSelector);
		if (cacheElement) {
			return cacheElement as T;
		}
		const element = this.view.querySelector<T>(cssSelector);
		if (element) {
			this.cache.set(cssSelector, element);
			return element;
		}
		return null;
	}

	public queryAll<T extends HTMLElement>(cssSelector: string, useCache = true): T[] {
		if (!useCache) {
			const nodeList = this.view.querySelectorAll<T>(cssSelector);
			return nodeList.length ? [...nodeList.values()] : [];
		}
		const cacheElement = this.cache.get(cssSelector);
		if (cacheElement) {
			return cacheElement as T[];
		}
		const nodeList = this.view.querySelectorAll<T>(cssSelector);
		if (nodeList.length) {
			const array = [...nodeList.values()];
			this.cache.set(cssSelector, array);
			return array;
		}
		return [];
	}

	public addBehavior(behavior: Behavior) {
		this._plugins.push(behavior);
		behavior.init(this.asComponent());
	}

	public removeBehavior(behavior: Behavior) {
		const { _plugins } = this;
		const index = _plugins.indexOf(behavior);
		if (index > -1) {
			this._plugins.splice(index, 1);
			behavior.destroy(this.asComponent());
		}
	}
}
