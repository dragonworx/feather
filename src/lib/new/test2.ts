/* eslint-disable @typescript-eslint/no-explicit-any */
export function test()
{
    const root = document.getElementById('root') as HTMLElement;

    interface Descriptor<PropsType extends object = object>
    {
        tagName: string;
        props: PropsType;
        classes?: string[];
        watchAttributes?: string[];
    }

    interface CustomEventListener
    {
        (evt: CustomEvent): void;
    }

    type ControlEventHandler = EventListener | CustomEventListener;

    type Constructor<T> = new (...args: any[]) => T;

    type WithDescriptor = { __descriptor: Descriptor };
    type WithProps = { initialProps: object };
    type WithAttributes = { observedAttributes: string[] };

    const tagPref = 'ctrl-';

    /** Custom Element registration function */
    function Ctrl<P extends object, C extends Constructor<Control<P>>>(
        htmlElementCtor: C,
        descriptor: Descriptor<P>
    )
    {
        const { tagName, watchAttributes } = descriptor;
        const fullTagName = tagPref + tagName;

        /** Initialise Custom Class */
        (htmlElementCtor as unknown as WithDescriptor).__descriptor = descriptor;
        watchAttributes && ((htmlElementCtor as unknown as WithAttributes).observedAttributes = watchAttributes);

        customElements.define(fullTagName, htmlElementCtor);

        /** Custom Class Instantiating */
        return class
        {
            constructor(props: Partial<P> = {})
            {
                const element = document.createElement(fullTagName) as InstanceType<C>;

                (element as unknown as WithProps).initialProps = props;

                return element;
            }
        } as unknown as new (props: Partial<P>) => InstanceType<C>;
    }

    /** Base Control extends HTMLElement as Custom Element */
    abstract class Control<
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

        public emit<D = any, K extends EventType = EventType>(
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

    /** Example Control */
    type ButtonProps = {
        x: number;
        y: number;
    };

    type Events = {
        event1: { foo: string };
    }

    /** Create an instantiable Control */
    const Button = Ctrl(class extends Control<ButtonProps, keyof Events>
    {
        constructor()
        {
            super();
        }

        protected mount(): void
        {
            console.log("mount")
            this.addEventListener('click', () => console.log(this.props));
        }

        protected unmount(): void
        {
            console.log("unmount!");
        }

        /** do a test */
        public test() { }
    }, {
        tagName: 'button',
        props: {
            x: 0,
            y: 0,
        },
        classes: ['test'],
        watchAttributes: ['size'],
    });

    /** Example Instantiation */
    const button = new Button({ x: 5 });

    button.textContent = 'Click me!';
    button.test();
    button.on('event1', () => console.log('event1'));

    setTimeout(() =>
    {
        button.emit<Events['event1']>('event1', { foo: '123' });
        button.setAttribute('size', '123');
        button.removeAttribute('size');
    }, 1000);

    (window as any).button = button;

    root.appendChild(button);
}