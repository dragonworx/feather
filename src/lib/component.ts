/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Behavior } from './behavior';
import { asArray, html, uniqueId } from './util';

interface CustomEventListener {
	(evt: CustomEvent): void;
}

export type ComponentEventHandler = EventListenerOrEventListenerObject | CustomEventListener;

export type ComponentEvent = 'rendered' | 'modelUpdated' | 'beforeMount' | 'beforeUnmount' | 'addedToParent' | 'removingFromParent';

const _attributePrefix = 'fx';
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
	private _id: string;
	private _styles: Partial<CSSStyleDeclaration> = {};
	private _classes: string[] = [];
	private _listeners: Map<string, ComponentEventHandler[]> = new Map(); // track custom event listeners internally

	protected behaviors: Behavior[] = [];
	protected model: ModelType;
	protected readonly children: Component<HTMLElement, object>[] = [];
	
	public readonly element: ElementType;
	public readonly _uid = uniqueId();

	public static descriptor: ComponentDescriptor = {
		id: 'component',
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
		this._id = descriptor.id;

		// init model
		this.model = {
			...descriptor.model,
			...model,
		};

		// create element and initialise it
		const element = this.element = html(descriptor.html);
		element.classList.add(...descriptors.map(descriptor => `${_attributePrefix}-${descriptor.id}`));
		element.setAttribute(`${_attributePrefix}-id`, this._uid);
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

		// clean up styles
		for (const key of Object.keys(this._styles)) {
			this.clearStyle(key as keyof CSSStyleDeclaration);
		}

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

	public querySelector<T extends HTMLElement>(cssSelector: string): T {
		return this.element.querySelector<T>(cssSelector) as T;
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

export function getDescriptors<T extends ComponentCtor>(ctor: T): ComponentDescriptor<object>[] {
	const descriptors: ComponentDescriptor<object>[] = [];
	let currentCtor: ComponentCtor = ctor;

	// walk up prototype chain and collect descriptors
	while (currentCtor) {
		if (currentCtor.descriptor) {
			descriptors.unshift(currentCtor.descriptor);
		}

		const newCtor = Object.getPrototypeOf(currentCtor) as ComponentCtor;

		if ((currentCtor as unknown) === Component) {
			break;
		}

		currentCtor = newCtor;
	}

	// check that all descriptors in array have unique ids
	const ids = new Set<string>();

	for (const descriptor of descriptors) {
		if (ids.has(descriptor.id)) {
			throw new Error(`duplicate component descriptor id '${descriptor.id}'`);
		}
		ids.add(descriptor.id);
	}

	return descriptors;
}