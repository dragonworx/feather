/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Behavior } from './behavior';
import { asArray, getDescriptors, html, uniqueId } from './util';

type HTMLEvent = keyof HTMLElementEventMap;

interface CustomEventListener {
	(evt: CustomEvent): void;
}

export type ControlEventHandler = EventListener | CustomEventListener;

export type ControlEvent = HTMLEvent | 'rendered' | 'propsChanged' | 'beforeMount' | 'beforeUnmount' | 'addedToParent' | 'removingFromParent';

const _attributePrefix = 'ctl';
const _metaPrefix = `${_attributePrefix}-control`;

export type ControlCtor = {
	new (...args: unknown[]): Control;
	descriptor: ControlDescriptor<object>;
	owner: () => HTMLElementWithMetaData;
};

export type HTMLElementWithMetaData = HTMLElement & { [_metaPrefix]: Control };

export type ControlDescriptor<Properties extends object = object> = {
	id: string;
	props: Properties;
	template: string;
	canHaveChildren?: boolean;
}

export abstract class Control<
	ElementType extends HTMLElement = HTMLElement,
	PropertiesType extends object = object,
	EventType extends string = ControlEvent
> {
	private _classes: string[] = [];
	private _listeners: Map<string, ControlEventHandler[]> = new Map(); // track custom event listeners internally
	private _behaviorsById: Map<string, Behavior> = new Map();
	private _isDisabled = false;
	
	protected behaviors: Behavior[] = [];
	protected _props: PropertiesType;
	protected readonly children: Control<HTMLElement, object>[] = [];
	
	public readonly element: ElementType;
	public readonly id = uniqueId();

	public static descriptor: ControlDescriptor = {
		id: 'control',
		props: {},
		template: '',
	}

	public static elementOwner(source: Event | EventTarget | null): Control | null {
		const element = source instanceof Event ? source.target : source;
		if (
			element &&
			_metaPrefix in element &&
			element[_metaPrefix] instanceof Control
		) {
			return element[_metaPrefix];
		}
		return null;
	}

	constructor(props?: Partial<PropertiesType>) {
		const descriptors = getDescriptors(this.constructor as ControlCtor);

		// get template
		const descriptor = descriptors[descriptors.length - 1] as ControlDescriptor<PropertiesType>;

		// init props
		this._props = {
			...descriptor.props,
			...props,
		};

		// create element and initialise it
		if (descriptor.template.trim().length === 0) {
			throw new Error('html template cannot be empty');
		}
		const element = this.element = html(descriptor.template);
		element.classList.add(...descriptors.map(descriptor => `${_attributePrefix}-${descriptor.id}`));
		element.setAttribute(`data-id`, this.id);
		(element as unknown as HTMLElementWithMetaData)[_metaPrefix] = this as unknown as Control;

		// call init for subclasses
		this.init();

		// run one full update cycle to update the element
		this.update(this._props);
	}

	protected get descriptor() {
		return (this.constructor as ControlCtor).descriptor;
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

	protected refresh() {
		this.render();
		this.onRendered();
		this.emit('rendered');
	}

	protected onRendered() {
		// override
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected onPropsChanged(value: Partial<PropertiesType>, oldValue: Partial<PropertiesType>): void {
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

	public prop<K extends keyof PropertiesType>(key: K): PropertiesType[K] {
		return this._props[key];
	}

	public get props() {
		return { ...this._props };
	}

	public update(value: Partial<PropertiesType>) {
		// get old values from value keys
		const oldValue = Object.keys(value).reduce((acc, key) => {
			acc[key as keyof PropertiesType] = this._props[key as keyof PropertiesType];
			return acc;
		}, {} as Partial<PropertiesType>);
		this._props = {
			...this._props,
			...value
		};
		this.onPropsChanged(value, oldValue);
		this.emit<ControlEvent>('propsChanged', { value, oldValue });
		this.refresh();
	}

	public asComponent() {
		return this as unknown as Control;
	}

	private listenersForType(type: string) {
		if (!this._listeners.has(type)) {
			this._listeners.set(type, []);
		}
		return this._listeners.get(type)!;
	}

	on<K extends string | undefined = EventType>(
		type: K extends EventType ? EventType : K extends undefined ? never : EventType,
		listener: ControlEventHandler,
		options?: boolean | AddEventListenerOptions
	): this {
		this.listenersForType(type).push(listener);
		this.element.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
		return this;
	}

	off<K extends string | undefined = EventType>(
		type: K extends EventType ? EventType : K extends undefined ? never : EventType,
		listener?: ControlEventHandler,
		options?: boolean | AddEventListenerOptions
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

	public mount(parent: HTMLElement | Control) {
		// todo: fire this.onBeforeMount + behaviors.onBeforeMount
		this.onBeforeMount();
		this.emit<ControlEvent>('beforeMount');
		(parent instanceof HTMLElement ? parent : parent.element).appendChild(this.element);
	}

	public unmount(dispose = true) {
		this.onBeforeUnMount();
		this.emit<ControlEvent>('beforeUnmount');
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
		if (!this._behaviorsById.has(id)) {
			throw new Error(`behavior with id '${id}' not found`);
		}
		return this._behaviorsById.get(id) as unknown as T;
	}

	public addBehavior(behavior: Behavior, id: string = behavior.id) {
		this.behaviors.push(behavior);

		if (this._behaviorsById.has(id)) {
			throw new Error(`behavior with id '${id}' already exists`);
		}
		
		this._behaviorsById.set(id, behavior);
		behavior.init(this.asComponent());

		return behavior;
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

	public addChild(child: Control<HTMLElement, object>) {
		if (this.descriptor.canHaveChildren === false) {
			throw new Error(`Control '${this.descriptor.id}' cannot have children`);
		}
		this.children.push(child);
		this.appendChild(child.element);
		child.emit<ControlEvent>('addedToParent', this.asComponent());
	}

	protected appendChild(element: HTMLElement) {
		// override in subclass for more specific child element targetting
		this.element.appendChild(element);
	}

	public removeChild(child: Control<HTMLElement, object>) {
		if (this.descriptor.canHaveChildren === false) {
			throw new Error(`Control '${this.descriptor.id}' cannot have children`);
		}
		const index = this.children.indexOf(child);
		if (index > -1) {
			child.emit<ControlEvent>('removingFromParent', this.asComponent());
			this.children.splice(index, 1);
			child.element.remove();
		} else {
			throw new Error('child not found');
		}
	}

	public getChildren() {
		return [...this.children];
	}

	public get isEnabled() {
		return !this._isDisabled;
	}

	public set isEnabled(value: boolean) {
		this._isDisabled = !value;
		this.setClassIf('disabled', !value);
	}
}
