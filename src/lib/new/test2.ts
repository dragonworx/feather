/* eslint-disable @typescript-eslint/no-explicit-any */
export function test()
{
    const root = document.getElementById('root') as HTMLElement;

    interface Descriptor<PropsType extends object = object>
    {
        tagName: string;
        props: PropsType;
        classes?: string[];
    }

    interface CustomEventListener
    {
        (evt: CustomEvent): void;
    }

    type ControlEventHandler = EventListener | CustomEventListener;

    type Constructor<T> = new (...args: any[]) => T;


    /** Custom Element registration function */
    function ctrl<P extends object, C extends Constructor<Base<P>>>(
        htmlElementCtor: C,
        descriptor: Descriptor<P>
    )
    {
        const { tagName } = descriptor;

        customElements.define(tagName, htmlElementCtor);

        return {
            new: (props: Partial<P> = {}): InstanceType<C> =>
            {
                const element = document.createElement(tagName) as InstanceType<C>;

                if (descriptor.classes)
                {
                    element.classList.add(...descriptor.classes);
                }

                element.setProps({
                    ...descriptor.props,
                    ...props,
                });

                return element;
            },
        };
    }

    /** Base Control extends HTMLElement as Custom Element */
    class Base<
        PropsType extends object = object,
        EventType extends string = string
    > extends HTMLElement
    {
        private _listeners: Map<string, ControlEventHandler[]> = new Map(); // track custom event listeners internally
        protected props: PropsType;

        constructor()
        {
            super();

            this.props = {} as PropsType;
        }

        public setProps(props: Partial<PropsType>)
        {
            this.props = {
                ...this.props,
                ...props,
            };
        }

        connectedCallback()
        {
            this.mount();
        }

        disconnectedCallback()
        {
            this.unmount();
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

        on<K extends string | undefined = EventType>(
            type: K extends EventType ? EventType : K extends undefined ? never : EventType,
            listener: ControlEventHandler,
            options?: boolean | AddEventListenerOptions
        ): this
        {
            this.listenersForType(type).push(listener);
            this.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
            return this;
        }

        off<K extends string | undefined = EventType>(
            type: K extends EventType ? EventType : K extends undefined ? never : EventType,
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

        public emit<K extends string | undefined = EventType>(
            type: K extends EventType ? EventType : K extends undefined ? never : EventType,
            detail?: any
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

    const Button = ctrl(class extends Base<ButtonProps, 'event1'>
    {
        constructor()
        {
            super();
        }

        protected mount(): void
        {
            this.addEventListener('click', () => console.log(this.props));
        }

        protected unmount(): void
        {
            console.log("unmount!");
        }

        public test() { }
    }, {
        tagName: 'control-button',
        props: {
            x: 0,
            y: 0,
        },
        classes: ['test']
    });

    /** Example Instantiation */
    const extendedButton = Button.new({ x: 5 });
    extendedButton.textContent = 'Click me!';
    extendedButton.test();
    extendedButton.on('event1', () => console.log('event1'));
    setTimeout(() => extendedButton.emit('event1'), 1000);

    (window as any).button = extendedButton;

    root.appendChild(extendedButton);
}