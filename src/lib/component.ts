/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Behavior } from './behavior';
import { asArray, getDescriptors, html, uniqueId } from './util';

interface CustomEventListener {
	(evt: CustomEvent): void;
}

export type ComponentEventHandler = EventListenerOrEventListenerObject | CustomEventListener;

export type ComponentEvent = 'rendered' | 'modelUpdated' | 'beforeMount' | 'beforeUnmount' | 'addedToParent' | 'removingFromParent';

const _attributePrefix = 'ctl';
const _metaPrefix = `${_attributePrefix}-component`;

export type ComponentCtor = {
	new (...args: unknown[]): Component;
	componentId: string;
	descriptor: ComponentDescriptor<object>;
	owner: () => HTMLElementWithMetaData;
};

export type HTMLElementWithMetaData = HTMLElement & { [_metaPrefix]: Component };

export type ComponentDescriptor<ModelType extends object = object> = {
	id: string;
	model: ModelType;
	html: string;
}

export abstract class Component<
	ElementType extends HTMLElement = HTMLElement,
	ModelType extends object = object,
> {
	private _classes: string[] = [];
	private _listeners: Map<string, ComponentEventHandler[]> = new Map(); // track custom event listeners internally
	private _behaviorsById: Map<string, Behavior> = new Map();
	
	protected behaviors: Behavior[] = [];
	protected model: ModelType;
	protected readonly children: Component<HTMLElement, object>[] = [];
	
	public readonly element: ElementType;
	public readonly id = uniqueId();

	public static descriptor: ComponentDescriptor = {
		id: 'control',
		model: {},
		html: '',
	}

	// must be overwritten by subclasses!
	public static componentId = 'component';

	public static elementOwner(source: Event | EventTarget | null): Component | null {
		const element = source instanceof Event ? source.target : source;
		if (
			element &&
			_metaPrefix in element &&
			element[_metaPrefix] instanceof Component
		) {
			return element[_metaPrefix];
		}
		return null;
	}

	constructor(model?: Partial<ModelType>) {
		const descriptors = getDescriptors(this.constructor as ComponentCtor);

		// get template
		const descriptor = descriptors[descriptors.length - 1] as ComponentDescriptor<ModelType>;

		// init model
		this.model = {
			...descriptor.model,
			...model,
		};

		// create element and initialise it
		if (descriptor.html.trim().length === 0) {
			throw new Error('html template cannot be empty');
		}
		const element = this.element = html(descriptor.html);
		element.classList.add(...descriptors.map(descriptor => `${_attributePrefix}-${descriptor.id}`));
		element.setAttribute(`data-id`, this.id);
		(element as unknown as HTMLElementWithMetaData)[_metaPrefix] = this as unknown as Component;

		// call init for subclasses
		this.init();

		// run one full update cycle to update the element
		this.set(this.model);
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

	

		// clean up classes
		this.clearClasses();
	}

	protected update() {
		this.render();
		this.onRendered();
		this.emit<ComponentEvent>('rendered');
	}

	protected onRendered() {
		// override
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected onModelChanged(value: Partial<ModelType>, oldValue: Partial<ModelType>): void {
		String(value);
		String(oldValue);
		// override
	}

	protected render(): void {
		// override
	}

	protected init() {
		// override
	}

	public get<K extends keyof ModelType>(key: K): ModelType[K] {
		return this.model[key];
	}

	public set(value: Partial<ModelType>) {
		// get old values from value keys
		const oldValue = Object.keys(value).reduce((acc, key) => {
			acc[key as keyof ModelType] = this.model[key as keyof ModelType];
			return acc;
		}, {} as Partial<ModelType>);
		this.model = {
			...this.model,
			...value
		};
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

	public setClassIf<T extends string>(cssClass: T | T[], conditional: boolean) {
		if (conditional) {
			this.addClass(cssClass);
		} else {
			this.removeClass(cssClass);
		}
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

	public setStyle(styles: Partial<CSSStyleDeclaration>) {
		Object.assign(this.element.style, styles);
		const value = this.element.getAttribute('style')?.replace(/\s*/g, '');
		value && this.element.setAttribute('style', value);
	}

	public clearStyle(key?: keyof CSSStyleDeclaration) {
		if (key) {
			this.element.style.removeProperty(String(key));
			return;
		}
		this.element.removeAttribute('style');
	}

	public querySelector<T extends HTMLElement>(cssSelector: string): T {
		return this.element.querySelector<T>(cssSelector) as T;
	}

	public querySelectorAll<T extends HTMLElement>(cssSelector: string): T[] {
		return [...this.element.querySelectorAll<T>(cssSelector).values()];
	}

	public behavior<T extends Behavior>(id: string) {
		return this._behaviorsById.get(id) as unknown as T;
	}

	public addBehavior(behavior: Behavior, id?: string) {
		this.behaviors.push(behavior);
		if (id) {
			this._behaviorsById.set(id, behavior);
		}
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

	public addChild(child: Component<HTMLElement, object>) {
		this.children.push(child);
		this.appendChildElement(child.element);
		child.emit<ComponentEvent>('addedToParent', this.asComponent());
	}

	protected appendChildElement(element: HTMLElement) {
		// override in subclass for more specific child element targetting
		this.element.appendChild(element);
	}

	public removeChild(child: Component<HTMLElement, object>) {
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
