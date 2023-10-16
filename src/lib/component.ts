/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Behavior } from './behavior';
import { collectIds, type ComponentCtor, type HTMLElementWithMetaData } from './const';
import { asArray, html, uniqueId } from './util';

interface CustomEventListener {
	(evt: CustomEvent): void;
}

export type ComponentEventHandler = EventListenerOrEventListenerObject | CustomEventListener;

export type ComponentEvent = 'elementUpdated' | 'modelUpdated' | 'beforeMount' | 'beforeUnmount' | 'addedToParent' | 'removingFromParent'
;

export abstract class Component<
	ElementType extends HTMLElement = HTMLElement,
	ModelType = undefined
> {
	private _id: string[];
	private _styles: Partial<CSSStyleDeclaration> = {};
	private _classes: string[] = [];
	private _listeners: Map<string, ComponentEventHandler[]> = new Map(); // track custom event listeners internally

	protected behaviors: Behavior[] = [];
	protected model: ModelType;
	protected readonly children: Component<HTMLElement, unknown>[] = [];

	public readonly element: ElementType;
	public readonly _uid = uniqueId();

	// must be overwritten by subclasses
	public static componentId = 'component';
	
	public static dataAttribute = 'data-com';

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
		// clean up behaviors
		for (const behavior of this.behaviors) {
			behavior.dispose();
		}
		this.behaviors.length = 0;

		// clean up listeners
		for (const [k, v] of this._listeners.entries()) {
			for (const listener of v) {
				this.element.removeEventListener(k, listener as EventListenerOrEventListenerObject);
			}
		}
		this._listeners.clear();

		// clean up styles
		for (const key of Object.keys(this._styles)) {
			this.clearStyle(key as keyof CSSStyleDeclaration);
		}

		// clean up classes
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
		this.emit<ComponentEvent>('elementUpdated');
	}

	protected onElementUpdated() {
		// override
	}

	private initElement(): void {
		const { element, _id } = this;
		element.classList.add(..._id);
		element.setAttribute(Component.dataAttribute, _id[_id.length - 1]);
		element.setAttribute(`${Component.dataAttribute}-id`, this._uid);
		(element as unknown as HTMLElementWithMetaData).__feather_component = this as unknown as Component;
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
		this.emit<ComponentEvent>('modelUpdated', { value, oldValue });
		this.update();
	}

	public asComponent() {
		return this as unknown as Component;
	}

	private listenersForType(type: string) {
		if (!this._listeners.has(type)) {
			this._listeners.set(type, []);
		}
		return this._listeners.get(type)!;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public on<K extends string>(
		type: K | keyof HTMLElementEventMap,
		listener: ComponentEventHandler,
		options?: boolean | AddEventListenerOptions
	): this;
	public on(
		type: string,
		listener: ComponentEventHandler,
		options?: boolean | AddEventListenerOptions
	): this {
		this.listenersForType(type).push(listener);
		this.element.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public off<K extends string>(
		type: K | keyof HTMLElementEventMap,
		listener?: ComponentEventHandler,
		options?: boolean | AddEventListenerOptions
	): this;
	public off(
		type: string,
		listener?: ComponentEventHandler,
		options?: boolean | EventListenerOptions
	): this {
		if (!this._listeners.has(type)) {
			return this;
		}
		const listeners = this.listenersForType(type);
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

	public getEventListeners<K extends string>(type: K | keyof HTMLElementEventMap) {
		return this._listeners.get(type) ?? [];
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
		this.onBeforeMount();
		this.emit<ComponentEvent>('beforeMount');
		(parent instanceof HTMLElement ? parent : parent.element).appendChild(this.element);
	}

	public unmount(dispose = true) {
		this.onBeforeUnMount();
		this.emit<ComponentEvent>('beforeUnmount');
		// todo: allow behaviors to prevent element from being removed so they can do it async?
		this.element.remove();
		if (dispose) {
			this.dispose();
		}
	}

	public get isMounted() {
		return this.element.parentElement !== null;
	}

	protected onBeforeMount() {
		// override
	}

	protected onBeforeUnMount() {
		// override
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

	public querySelector<T extends HTMLElement>(cssSelector: string): T | null {
		return this.element.querySelector<T>(cssSelector);
	}

	public querySelectorAll<T extends HTMLElement>(cssSelector: string): T[] {
		return [...this.element.querySelectorAll<T>(cssSelector).values()];
	}

	public addBehavior(behavior: Behavior) {
		this.behaviors.push(behavior);
		behavior.init(this.asComponent());
	}

	public removeBehavior(behavior: Behavior): Behavior {
		const { behaviors: _behaviors } = this;
		const index = _behaviors.indexOf(behavior);
		if (index > -1) {
			behavior.dispose();
			this.behaviors.splice(index, 1);
		} else {
			throw new Error('behavior not found');
		}
		return behavior;
	}

	public addChild(child: Component<HTMLElement, unknown>) {
		this.children.push(child);
		this.appendChildElement(child.element);
		child.emit<ComponentEvent>('addedToParent', this.asComponent());
	}

	protected appendChildElement(element: HTMLElement) {
		// override in subclass for more specific child element targetting
		this.element.appendChild(element);
	}

	public removeChild(child: Component<HTMLElement, unknown>) {
		const index = this.children.indexOf(child);
		if (index > -1) {
			child.emit<ComponentEvent>('removingFromParent', this.asComponent());
			this.children.splice(index, 1);
			child.element.remove();
		} else {
			throw new Error('child not found');
		}
	}

	public getChildren() {
		return [...this.children];
	}
}
