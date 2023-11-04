import type { WithDescriptor } from './builder';


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

    protected props: PropsType = {} as PropsType;
    protected initialProps?: Partial<PropsType>;

    constructor()
    {
        super();
    }

    protected get descriptor()
    {
        return (this.constructor as unknown as WithDescriptor).__descriptor;
    }

    protected get fullTagName()
    {
        return (this.constructor as unknown as WithFullTagname).fullTagName;
    }

    public setProps(props: Partial<PropsType>)
    {
        console.log("set props", '#' + this.fullTagName, props);

        this.props = {
            ...this.props,
            ...props,
        };
    }

    connectedCallback()
    {
        const { descriptor } = this;

        if (descriptor.classes)
        {
            this.classList.add(...descriptor.classes);
        }

        const initialProps = (this as unknown as WithProps).initialProps;

        this.setProps({
            ...descriptor.props,
            ...initialProps,
            ...this.props,
        });

        this.mount();
    }

    disconnectedCallback()
    {
        this.unmount();
    }

    adoptedCallback()
    {
        console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
    {
        console.log(`Attribute ${name} has changed.`, oldValue, newValue);

        // if this is a prop, call set prop with value
        if (name in this.props)
        {
            this.setProps({
                [name]: newValue
            } as Partial<PropsType>);
        }

        this.onAttributeChanged(name, oldValue, newValue);
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAttributeChanged(name: string, oldValue: string | null, newValue: string | null) { /** override */ }

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