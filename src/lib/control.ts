import type { Descriptor, WithDescriptor } from './builder';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomEventListener<T = any>
{
    (evt: CustomEvent<T>): void;
}

export type ControlEventHandler = EventListener | CustomEventListener;

export type Constructor<T> = new (...args: unknown[]) => T;


export type WithFullTagname = { fullTagName: string };
export type WithProps = { initialProps: object };
export type WithAttributes = { observedAttributes: string[] };

type EventMap = {
    [k: string]: object | null | undefined;
};

/** Base Control extends HTMLElement as Custom Element */
export abstract class Control<
    PropsType extends object = object,
    EventType extends EventMap = EventMap
> extends HTMLElement
{
    private _listeners: Map<string, CustomEventListener[]> = new Map(); // track custom event listeners internally
    private _isMounted = false;

    protected props: PropsType = {} as PropsType;
    protected initialProps?: Partial<PropsType>;

    constructor()
    {
        super();
    }

    protected get descriptor(): Descriptor<PropsType>
    {
        return (this.constructor as unknown as WithDescriptor).__descriptor as Descriptor<PropsType>;
    }

    protected get fullTagName()
    {
        return (this.constructor as unknown as WithFullTagname).fullTagName;
    }

    protected get isMounted()
    {
        return this._isMounted
    }

    public setProp(name: keyof PropsType, value: PropsType[keyof PropsType])
    {
        this.setProps({ [name]: value } as Partial<PropsType>);
    }

    public setProps(props: Partial<PropsType>)
    {
        console.log("set props", '#' + this.fullTagName, props);

        this.props = {
            ...this.props,
            ...props,
        };
    }

    protected connectedCallback()
    {
        // official entry point, not constructor
        const { descriptor } = this;

        if (descriptor.classes)
        {
            this.classList.add(...descriptor.classes);
        }

        const initialProps = (this as unknown as WithProps).initialProps;

        this._isMounted = true;

        this.setProps({
            ...descriptor.props,
            ...initialProps,
            ...this.props,
        });


        this.mount();
    }

    protected disconnectedCallback()
    {
        this._isMounted = false;
        this.unmount();
    }

    protected adoptedCallback()
    {
        this.onDocumentChange();
    }

    protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
    {
        console.log(`Attribute ${name} has changed.`, oldValue, newValue);

        const passToProps = this.onAttributeChanged(name, oldValue, newValue);

        if (passToProps === false)
        {
            return;
        }

        const attribute = this.descriptor.attributes![name as keyof PropsType];

        if (name in this.descriptor.props && attribute)
        {
            if (newValue === null)
            {
                this.setProp(name as keyof PropsType, this.descriptor.props[name as keyof PropsType]);
            } else
            {
                const isValid = attribute.validate!(newValue);
                const propKey = name as keyof PropsType;

                if (!isValid)
                {
                    throw new Error(`${this.fullTagName}: Invalid value for attribute "${name}": "${newValue}"`);
                }

                if (attribute.type === 'number')
                {
                    this.setProp(propKey, parseFloat(newValue) as PropsType[keyof PropsType]);
                } else if (attribute.type === 'boolean')
                {
                    this.setProp(propKey, (newValue.toLowerCase() === 'true') as PropsType[keyof PropsType]);
                } else
                {
                    this.setProp(name as keyof PropsType, newValue as PropsType[keyof PropsType]);
                }
            }

        }
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): false | void { /** override */ }

    private listenersForType(type: string)
    {
        if (!this._listeners.has(type))
        {
            this._listeners.set(type, []);
        }
        return this._listeners.get(type)!;
    }

    public on = (<T extends EventType>() =>
        <E extends keyof T>(
            type: E,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);
            this.listenersForType(key).push(listener);
            this.addEventListener(key, listener as EventListenerOrEventListenerObject, options);

            return this;
        })();

    public off = (<T extends EventType>() =>
        <E extends keyof T>(
            type: E,
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

    public emit = (<T extends EventType>() =>
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