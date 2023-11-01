import type { ControlEventHandler, WithDescriptor, WithProps } from '.';

/** Base Control extends HTMLElement as Custom Element */
export abstract class Control<
    PropsType extends object = object,
    EventType extends string = string
> extends HTMLElement
{
    private _listeners: Map<string, ControlEventHandler[]> = new Map(); // track custom event listeners internally
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

    public setProps(props: Partial<PropsType>)
    {
        console.log("set props", props)
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
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    private listenersForType(type: string)
    {
        if (!this._listeners.has(type))
        {
            this._listeners.set(type, []);
        }
        return this._listeners.get(type)!;
    }

    on<K extends EventType>(
        type: K,
        listener: ControlEventHandler,
        options?: boolean | AddEventListenerOptions
    ): this
    {
        this.listenersForType(type).push(listener);
        this.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
        return this;
    }

    off<K extends EventType>(
        type: K,
        listener?: ControlEventHandler,
        options?: boolean | AddEventListenerOptions
    ): this
    {
        if (!this._listeners.has(type))
        {
            return this;
        }

        const listeners = this.listenersForType(type);

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
                this._listeners.delete(type);
            }

            this.removeEventListener(
                type,
                listener as EventListenerOrEventListenerObject,
                options
            );
        } else
        {
            // remove all
            for (const l of listeners)
            {
                this.removeEventListener(type, l as EventListenerOrEventListenerObject, options);
            }

            this._listeners.delete(type);
        }
        return this;
    }

    public emit<D = unknown, K extends EventType = EventType>(
        type: K,
        detail?: D
    ): this
    {
        this.dispatchEvent(
            new CustomEvent(type, {
                detail,
                bubbles: true,
                cancelable: true
            })
        );

        return this;
    }
}