import { type CustomEventListener, type WithMeta, attributeValidators } from './builder';
import { installContextHook, uninstallContextHook } from './contextMenu';
import { unregisterElement, createStyle } from './stylesheet';
import { toCamelCase } from './util';

let _id = 0;

/** ------- BaseControl ------- */
export class BaseControl<
    StateType extends object = object,
    EventsType = object,
> extends HTMLElement
{
    private _muteAttributeChanged = false;
    private _listeners: Map<string, CustomEventListener[]> = new Map();

    protected _id = String(_id++);
    protected _isMounted = false;
    protected _cssClass?: string;
    protected _shadowDom?: ShadowRoot;
    protected _state: StateType = {} as StateType;
    protected _initialState: Partial<StateType> = {};

    constructor()
    {
        super();

        const { descriptor: { state } } = this.meta;

        /** Define the getters and setters based on props */
        if (state)
        {
            for (const key of Object.keys(state))
            {
                const propKey = key as keyof StateType;

                Object.defineProperty(this, key, {
                    get()
                    {
                        return this['_state'][propKey];
                    },
                    set(value: unknown)
                    {
                        const oldValue = this['_state'][propKey];
                        if (this.hasAttribute(key))
                        {
                            this['_muteAttributeChanged'] = true;
                            this.setAttribute(key, String(value));
                            this['_muteAttributeChanged'] = false;
                        }
                        this['_state'][propKey] = value;
                        this['onStateChanged'](propKey, oldValue, value);
                    }
                });
            }
        }
    }

    protected get meta() {
        return (this.constructor as unknown as WithMeta)._meta;
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
        return this.meta.fullTagName;
    }

    protected get shadowDom()
    {
        if (!this._shadowDom)
        {
            this._shadowDom = this.attachShadow({ mode: 'open' });
        }
        return this._shadowDom;
    }

    protected get state()
    {
        return this as unknown as StateType;
    }

    private init() {
        const { classes, state } = this.meta.descriptor;

         // install props
         this['_state'] = {
            ...state,
            ...this._initialState,
            ...this._state,
        } as StateType;

        if (classes)
        {
            this.classList.add(...classes);
        }

        this.setAttribute('ctrl-id', this.controlId);

        this._isMounted = true;

        this.render();
        this.applyStyle();

        installContextHook(this as unknown as BaseControl);
    }

    private dispose() {
        this._isMounted = false;
        uninstallContextHook(this as unknown as BaseControl);
    }

    protected connectedCallback()
    {
        this.init();
        this.mount();
    }

    protected disconnectedCallback()
    {
        this.dispose();
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

    protected setClass(cssClass: string, predicate: boolean) {
        if (predicate)
        {
            if (!this.classList.contains(cssClass)) {
                this.classList.add(cssClass);
            }
        } else
        {
            if (this.classList.contains(cssClass)) {
                this.classList.remove(cssClass);
            }
        }
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }

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

    protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
    {
        if (this._muteAttributeChanged)
        {
            return;
        }

        const stateKey = toCamelCase(name);
        
        console.log(`${this.fullTagName}.attributeChangedCallback`, `${name}=${stateKey}`, oldValue, newValue);

        if (this.onAttributeChanged(stateKey, oldValue, newValue) === false)
        {
            return;
        }

        if (stateKey in this.meta.descriptor.state)
        {
            const propKey = stateKey as keyof StateType;

            if (newValue === null)
            {
                this._state[propKey] = this.meta.descriptor.state![stateKey as keyof StateType];
            } else
            {
                const type = typeof this.meta.descriptor.state![stateKey as keyof StateType];

                const validator = attributeValidators[type];

                if (validator !== undefined && !validator(newValue))
                {
                    const message1 = `${this.fullTagName}: Invalid value for attribute "${stateKey}".`;
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

    protected onContext(e: MouseEvent)
    {
        console.log(`${this.fullTagName}.onContext`, e);
    }
}