/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStyle, unregisterElement } from './stylesheet';
import { toHyphenCase } from './util';

/** ------- Types ------- */
export type Constructor<T, StateType = any> = new (state?: Partial<StateType>) => T;

export interface CustomEventListener<T = any>
{
    (evt: CustomEvent<T>): void;
}

type AttributeValidator = (value: string) => boolean;
export const attributeValidators: Record<string, AttributeValidator> = {
    string: () => true,
    number: (value) => !isNaN(Number(value)),
    boolean: (value) => { const val = String(value).toLowerCase(); return val === "true" || val === "false" },
};

export interface Descriptor<StateType extends object>
{
    tagName: string;
    classes?: string[];
    state?: StateType;
}

export type ControlMeta<
    StateType extends object,
> = {
    fullTagName: string;
    descriptor: Descriptor<StateType>;
};

let _id = 0;

/** ------- BaseControl ------- */
export class BaseControl<
    StateType extends object = object,
    EventsType = object,
> extends HTMLElement
{
    private _muteAttributeChanged = false;
    protected _meta: ControlMeta<StateType> = {} as ControlMeta<StateType>;
    protected _id = String(_id++);
    protected _isMounted = false;
    protected _cssClass?: string;
    protected _shadowDom?: ShadowRoot;
    protected _state: StateType = {} as StateType;

    private _listeners: Map<string, CustomEventListener[]> = new Map();

    constructor()
    {
        super();
    }

    public get controlId()
    {
        return this._id;
    }

    public get styleSheetId()
    {
        return this._cssClass;
    }

    public get fullTagName()
    {
        return this._meta.fullTagName;
    }

    protected get shadowDom()
    {
        if (!this._shadowDom)
        {
            this._shadowDom = this.attachShadow({ mode: 'open' });
        }
        return this._shadowDom;
    }

    protected get state() {
        return this as unknown as StateType;
    }

    protected connectedCallback()
    {
        const { descriptor } = this._meta;

        if (descriptor.classes)
        {
            this.classList.add(...descriptor.classes);
        }

        this.setAttribute('ctrl-id', this.controlId);

        this._isMounted = true;

        this.render();
        this.applyStyle();
        this.mount();
    }

    protected disconnectedCallback()
    {
        this._isMounted = false;
        this.unmount();

        unregisterElement(this as unknown as BaseControl, this._cssClass);
    }

    protected adoptedCallback()
    {
        this.onDocumentChange();
    }

    public render()
    {
        if (!this._isMounted)
        {
            return;
        }

        const innerHTML = this.html();

        if (innerHTML)
        {
            this.innerHTML = innerHTML;
        }
    }

    public applyStyle()
    {
        if (!this._isMounted)
        {
            return;
        }

        const cssText = this.css();

        if (cssText)
        {
            this._cssClass = createStyle(cssText, this as unknown as BaseControl);
        }
    }

    protected html(): string | void
    {
        return;
    }

    protected css(): string | void
    {
        return
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }

    protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
    {
        if (this._muteAttributeChanged) {
            return;
        }
        
        console.log(`${this.fullTagName}.attributeChangedCallback`, name, oldValue, newValue);

        if (this.onAttributeChanged(name, oldValue, newValue) === false)
        {
            return;
        }

        if (name in this._state)
        {
            const propKey = name as keyof StateType;

            if (newValue === null)
            {
                this._state[propKey] = this._meta.descriptor.state![name as keyof StateType];
            } else
            {
                const type = typeof this._meta.descriptor.state![name as keyof StateType];

                const validator = attributeValidators[type];

                if (validator !== undefined && !validator(newValue))
                {
                    const message1 = `${this.fullTagName}: Invalid value for attribute "${name}".`;
                    const message2 = `Expected: ${type}, Received: ${typeof newValue}`;
                    console.warn(`${message1} ${message2}`);
                    return;
                }

                switch (type)
                {
                    case 'number':
                        this.state[propKey] = parseFloat(newValue) as StateType[keyof StateType];
                        break;
                    case 'boolean':
                        this.state[propKey] = (newValue.toLowerCase() === 'true') as StateType[keyof StateType];
                        break;
                    case 'string':
                        this.state[propKey] = newValue as StateType[keyof StateType];
                }
            }

        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): false | void { /** override */ }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onStateChanged<K extends keyof StateType>(name: K, oldValue: StateType[K], newValue: StateType[K]) { /** override */ }

    private listenersForType(type: string)
    {
        if (!this._listeners.has(type))
        {
            this._listeners.set(type, []);
        }
        return this._listeners.get(type)!;
    }

    public on = (<T extends EventsType>() =>
        <E extends keyof T>(
            type: E | keyof HTMLElementEventMap,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);

            this.listenersForType(key).push(listener);
            this.addEventListener(key, listener as EventListenerOrEventListenerObject, options);

            return this;
        })();

    public off = (<T extends EventsType>() =>
        <E extends keyof T>(
            type: E | keyof HTMLElementEventMap,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);

            if (!this._listeners.has(key))
            {
                return this;
            }

            const listeners = this.listenersForType(key);

            if (listener)
            {
                // remove listener
                const index = listeners.indexOf(listener);
                
                if (index !== -1)
                {
                    listeners.splice(index, 1);
                }

                if (listeners.length === 0)
                {
                    this._listeners.delete(key);
                }

                this.removeEventListener(
                    key,
                    listener as EventListenerOrEventListenerObject,
                    options
                );
            } else
            {
                // remove all
                for (const l of listeners)
                {
                    this.removeEventListener(key, l as EventListenerOrEventListenerObject, options);
                }

                this._listeners.delete(key);
            }

            return this;
        })();

    public emit = (<T extends EventsType>() =>
        <E extends keyof T>(
            type: E,
            detail?: T[E] extends object ? T[E] : (T[E] extends null ? null : object)
        ): this =>
        {
            const key = String(type);

            this.dispatchEvent(
                new CustomEvent(key, {
                    detail,
                    bubbles: true,
                    cancelable: true
                })
            );

            return this;
        })();
}

/** ------- Ctrl ------- */
export const tagPref = 'ctrl-';

export function Ctrl<
    StateType extends object,
    EventsType,
>(
    descriptor: Descriptor<StateType>,
    ctor: Constructor<BaseControl<StateType, EventsType>, StateType>
)
{
    type CtorType = typeof ctor;

    const { tagName, state: descProps } = descriptor;
    const fullTagName = tagPref + (tagName ?? toHyphenCase(ctor.name));

    if (fullTagName.endsWith('-') || fullTagName.startsWith('-'))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    // setup custom element
    if (descProps)
    {
        (ctor as any).observedAttributes = Object.keys(descProps);
    }

    customElements.define(fullTagName, ctor);

    return class
    {
        constructor(state: Partial<StateType> = {})
        {
            // create element
            const element = document.createElement(fullTagName) as InstanceType<CtorType>;

            // install metadata
            element['_meta'] = {
                fullTagName,
                descriptor,
            };

            // install props
            element['_state'] = {
                ...descProps,
                ...state,
            } as StateType;

            /** Define the getters and setters based on props */
            if (descProps)
            {
                for (const key of Object.keys(descProps))
                {
                    const propKey = key as keyof StateType;

                    Object.defineProperty(element, key, {
                        get()
                        {
                            return element['_state'][propKey];
                        },
                        set(value: any)
                        {
                            const oldValue = element['_state'][propKey];
                            if (element.hasAttribute(key)) {
                                element['_muteAttributeChanged'] = true;
                                element.setAttribute(key, String(value));
                                element['_muteAttributeChanged'] = false;
                            }
                            element['_state'][propKey] = value;
                            element['onStateChanged'](propKey, oldValue, value);
                        }
                    });
                }
            }

            // return element as ctor with props
            return element;
        }
    } as unknown as new (state?: Partial<StateType>) => InstanceType<CtorType> & StateType;
}
