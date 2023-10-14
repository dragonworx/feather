/* eslint-disable @typescript-eslint/no-explicit-any */
import { collectIds, type ComponentCtor, type HTMLElementWithMetaData } from './const';
import { Behavior } from './behavior';
import { asArray, html, uniqueId } from './util';
import { Cache } from './cache';

interface CustomEventListener {
	(evt: CustomEvent): void;
}

type EventHandler = EventListenerOrEventListenerObject | CustomEventListener;

export abstract class Component<
	ElementType extends HTMLElement = HTMLElement,
	ModelType = undefined
> {
	private _id: string[];
	private _styles: Partial<CSSStyleDeclaration> = {};
	private _classes: string[] = [];
	private _listeners: Map<string, EventHandler[]> = new Map(); // track custom event listeners internally

	protected behaviors: Behavior[] = [];
	protected model: ModelType;

	public readonly element: ElementType;
	public readonly cache: Cache<string, any> = new Cache();
	public readonly _uid = uniqueId();

	// must be ovewritten by subclasses
	public static componentId = 'component';

	public static elementOwner(source: Event | EventTarget | null): Component | null {
		const element = source instanceof Event ? source.target : source;
		if (
			element &&
			'__feather_component' in element &&
			element.__feather_component instanceof Component
		) {
			return element.__feather_component;
		}
		return null;
	}

	constructor(model?: ModelType) {
		this._id = collectIds(this.constructor as ComponentCtor);

		this.model = model ?? this.defaultModel();
		this.element = this.createElement();

		this.initElement();
		this.init();

		this.value = this.model;
	}

	public dispose() {
		for (const behavior of this.behaviors) {
			behavior.dispose();
		}
		this.behaviors.length = 0;
		for (const [k, v] of this._listeners.entries()) {
			for (const listener of v) {
				this.element.removeEventListener(k, listener as EventListenerOrEventListenerObject);
			}
		}
		this._listeners.clear();
		for (const key of Object.keys(this._styles)) {
			this.clearStyle(key as keyof CSSStyleDeclaration);
		}
		this.clearClasses();
	}

	protected defaultModel(): ModelType {
		return undefined as ModelType;
	}

	public template(): string {
		return '<div></div>';
	}

	protected createElement(): ElementType {
		return html(this.template());
	}

	protected update() {
		this.updateElement();
		this.onElementUpdated();
		for (const behavior of this.behaviors) {
			behavior.onElementUpdated();
		}
	}

	protected onElementUpdated() {
		// override
	}

	private initElement(): void {
		const { element: view, _id } = this;
		view.classList.add(..._id);
		view.setAttribute('data-com', _id[_id.length - 1]);
		(view as unknown as HTMLElementWithMetaData).__feather_component = this as unknown as Component;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected onModelChanged(value: ModelType, oldValue: ModelType): void {
		String(value);
		String(oldValue);
		// override
	}

	protected updateElement(): void {
		// override
	}

	protected init() {
		// override
	}

	public get value() {
		return this.model;
	}

	public set value(value: ModelType) {
		const oldValue = this.model;
		this.model = value;
		this.onModelChanged(value, oldValue);
		for (const behavior of this.behaviors) {
			behavior.onModelChanged(value, oldValue);
		}
		this.update();
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
		listener: EventHandler,
		options?: boolean | AddEventListenerOptions
	): this;
	public on(
		type: string,
		listener: EventHandler,
		options?: boolean | AddEventListenerOptions
	): this {
		this.getListeners(type).push(listener);
		this.element.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public off<K extends string>(
		type: K | keyof HTMLElementEventMap,
		listener: EventHandler,
		options?: boolean | AddEventListenerOptions
	): this;
	public off(
		type: string,
		listener?: EventHandler,
		options?: boolean | EventListenerOptions
	): this {
		if (!this._listeners.has(type)) {
			return this;
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
			this.element.removeEventListener(
				type,
				listener as EventListenerOrEventListenerObject,
				options
			);
		} else {
			// remove all
			for (const l of listeners) {
				this.element.removeEventListener(type, l as EventListenerOrEventListenerObject, options);
			}
			this._listeners.delete(type);
		}
		return this;
	}

	public emit<K extends string>(type: K | keyof HTMLElementEventMap, detail?: any): this {
		this.element.dispatchEvent(
			new CustomEvent(type, {
				detail,
				bubbles: true,
				cancelable: true
			})
		);
		return this;
	}

	public style(styles: Partial<CSSStyleDeclaration>) {
		this._styles = { ...this._styles, ...styles };
		Object.assign(this.element.style, styles);
	}

	public hasStyle(key: keyof CSSStyleDeclaration, value?: string) {
		return key in this._styles && (value === undefined || this._styles[key] === value);
	}

	public clearStyle(key?: keyof CSSStyleDeclaration) {
		if (key) {
			this.element.style.removeProperty(String(key));
			delete this._styles[key];
			return;
		}
		for (const key of Object.keys(this._styles)) {
			this.element.style.removeProperty(key);
		}
		this._styles = {};
	}

	public mount(parent: HTMLElement | Component) {
		// todo: fire this.onBeforeMount + behaviors.onBeforeMount
		(parent instanceof HTMLElement ? parent : parent.element).appendChild(this.element);
	}

	public unmount(dispose = true) {
		// todo: onBeforeUnMount? How can a behavior intercept and cancel removing element to manage by self (eg: animation/transition)
		this.element.remove();
		if (dispose) {
			this.dispose();
		}
	}

	public hasClass<T extends string>(cssClass: T | T[]) {
		for (const cls of asArray(cssClass)) {
			if (this.element.classList.contains(cls)) {
				return true;
			}
		}
		return false;
	}

	public addClass<T extends string>(cssClass: T | T[]) {
		const { classList } = this.element;
		for (const cls of asArray(cssClass)) {
			if (classList.contains(cls)) {
				continue;
			}
			classList.add(cls);
			this._classes.push(cls);
		}
	}

	public removeClass<T extends string>(cssClass: T | T[]) {
		const { classList } = this.element;
		for (const cls of asArray(cssClass)) {
			if (classList.contains(cls)) {
				this._classes.splice(this._classes.indexOf(cls), 1);
				classList.remove(cls);
			}
		}
	}

	public clearClasses() {
		const { classList } = this.element;
		for (const cssClass of this._classes) {
			classList.remove(cssClass);
		}
		this._classes.length = 0;
	}

	public query<T extends HTMLElement>(cssSelector: string, useCache = true): T | null {
		if (!useCache) {
			return this.element.querySelector<T>(cssSelector);
		}
		const cacheElement = this.cache.get(cssSelector);
		if (cacheElement) {
			return cacheElement as T;
		}
		const element = this.element.querySelector<T>(cssSelector);
		if (element) {
			this.cache.set(cssSelector, element);
			return element;
		}
		return null;
	}

	public queryAll<T extends HTMLElement>(cssSelector: string, useCache = true): T[] {
		if (!useCache) {
			const nodeList = this.element.querySelectorAll<T>(cssSelector);
			return nodeList.length ? [...nodeList.values()] : [];
		}
		const cacheElement = this.cache.get(cssSelector);
		if (cacheElement) {
			return cacheElement as T[];
		}
		const nodeList = this.element.querySelectorAll<T>(cssSelector);
		if (nodeList.length) {
			const array = [...nodeList.values()];
			this.cache.set(cssSelector, array);
			return array;
		}
		return [];
	}

	public addBehavior(behavior: Behavior) {
		this.behaviors.push(behavior);
		behavior.init(this.asComponent());
	}

	public removeBehavior<T extends Behavior>(behavior: Behavior | (new () => T)): Behavior {
		if (behavior instanceof Behavior) {
			const { behaviors: _behaviors } = this;
			const index = _behaviors.indexOf(behavior);
			if (index > -1) {
				behavior.dispose();
				this.behaviors.splice(index, 1);
			}
			return behavior;
		} else {
			for (const b of this.behaviors) {
				if (b instanceof behavior) {
					this.removeBehavior(b);
					return b;
				}
			}
		}
		throw new Error('behavior not found');
	}
}
