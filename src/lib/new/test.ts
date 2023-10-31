/* eslint-disable @typescript-eslint/no-explicit-any */

export function test()
{
    type EventDescriptor = {
        [key: string]: object;
    };

    type EventHandler<T = any> = (event: T) => void;

    type MixinFunction<PropsType extends object, Api extends object, EventType extends EventDescriptor> =
        (control: ControlBase<PropsType, EventType>) => Mixin<PropsType, Api, EventType>;

    type Mixin<PropsType extends object = object, Api = object, EventType extends EventDescriptor = EventDescriptor> = {
        id: string;
        defaultProps: PropsType;
        public: Api;
        events: (keyof EventType)[];
    };

    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

    type MixinsApi<M extends Array<MixinFunction<any, any, any>>> = UnionToIntersection<{
        [K in keyof M]: ReturnType<M[K]> extends Mixin<any, infer Api, any> ? Api : never;
    }[number]>;

    function createMixin<PropsType extends object, Api extends object, EventType extends EventDescriptor>(
        mixinFunc: (control: ControlBase<PropsType, EventType>) => { id: string; public: Api; defaultProps: PropsType; events: (keyof EventType)[] }
    ): MixinFunction<PropsType, Api, EventType>
    {
        return mixinFunc;
    }

    interface Descriptor<PropsType extends object, M extends Array<MixinFunction<any, any, any>> | undefined>
    {
        id: string;
        defaultProps: PropsType;
        template: string;
        mixins?: M;
    }

    type ExtractEventsFromMixins<Mixins extends any[]> = {
        [K in keyof Mixins]: Mixins[K] extends MixinFunction<any, any, infer Events>
        ? keyof Events
        : never;
    }[number];

    function Control<P extends object, M extends Array<MixinFunction<any, any, any>> | undefined>(
        desc: Descriptor<P, M>
    )
    {
        // Merge defaultProps
        type MixedProps = M extends undefined ? P : (P & UnionToIntersection<ReturnType<NonNullable<M>[number]>['defaultProps']>);

        // Define MixedEvents using MergeEventTypes
        type MixedEvents = MergeEventTypes<NonNullable<M>>;

        return createMixedControlClass<MixedProps, MixedEvents, M>(desc as unknown as Descriptor<MixedProps, M>); // pass the MixedProps and MixedEvents as type arguments
    }

    type MergeEventTypes<Mixins extends any[]> = {
        [K in ExtractEventsFromMixins<Mixins>]:
        Mixins[number] extends MixinFunction<any, any, infer Events> ? K extends keyof Events ? Events[K] : never : never;
    };

    abstract class ControlBase<P extends object, E extends EventDescriptor = EventDescriptor> {
        private _eventHandlers: Record<string, EventHandler<any>[]> = {};
        public props: P;

        constructor(props: Partial<P> = {})
        {
            this.props = props as P;
        }

        on<K extends keyof E>(event: K, handler: EventHandler<E[K]>): void
        {
            const k = String(event);
            if (!this._eventHandlers[k])
            {
                this._eventHandlers[k] = [];
            }
            this._eventHandlers[k].push(handler as EventHandler<any>);
        }

        emit<K extends keyof E>(event: K, data?: Partial<E[K]>): void
        {
            const k = String(event);
            if (this._eventHandlers[k])
            {
                this._eventHandlers[k].forEach((handler) => handler(data as any));
            }
        }

        protected init()
        {
            //
        }
    }

    // ... rest of your code remains the same


    function createMixedControlClass<P extends object, E extends EventDescriptor, M extends Array<MixinFunction<any, any, any>> | undefined>(
        descriptor: Descriptor<P, M>
    )
    {
        type MixedProps = P;
        type MixedEvents = E;
        type MixedApi = M extends undefined ? object : MixinsApi<NonNullable<M>>;

        return class MixedControl extends ControlBase<MixedProps, MixedEvents> {
            public descriptor = descriptor;

            constructor(props: Partial<MixedProps> = {})
            {
                super({
                    ...descriptor.defaultProps,
                    ...props,
                });

                if (descriptor.mixins)
                {
                    for (const mixinFunc of descriptor.mixins)
                    {
                        const mixin = mixinFunc(this);
                        Object.assign(this, mixin.public);
                    }
                }

                this.init();
            }
        } as new (props: Partial<MixedProps>) => ControlBase<MixedProps, MixedEvents> & MixedApi;
    }

    type Props<T> = T extends new (props: infer P) => any ? P : never;

    // Example Mixin1
    type Mixin1Props = { mixin1: string };
    type Mixin1Events = {
        mixin1Event: { x: number };
    };

    // Using factory function for mixin1
    const mixin1 = createMixin((control: ControlBase<Mixin1Props, Mixin1Events>) =>
    {
        console.log('mixin1', control, control.props);

        return {
            id: 'mixin1',
            defaultProps: { mixin1: 'mixin1' },
            public: {
                mixin1Method()
                {
                    control.emit('mixin1Event', { x: 123 });
                    return 'foo';
                },
            },
            events: ['mixin1Event'],
        };
    });

    // Example Mixin2
    type Mixin2Props = { mixin2: string };
    type Mixin2Events = {
        mixin2Event: { y: number };
    };

    const mixin2 = createMixin((control: ControlBase<Mixin2Props, Mixin2Events>) =>
    {
        console.log('mixin2', control, control.props);

        return {
            id: 'mixin2',
            defaultProps: { mixin2: 'mixin2' },
            public: {
                mixin2Method()
                {
                    control.emit('mixin2Event', { y: 456 });
                    return 'bar';
                },
            },
            events: ['mixin2Event'],
        };
    });

    const MixedBase = Control({
        id: 'test',
        defaultProps: {
            foo: 'bar',
            bar: 1,
        },
        template: '<div></div>',
        mixins: [mixin1, mixin2],
    });


    class MixedControl extends MixedBase
    {
        constructor(props: Partial<Props<typeof MixedBase>>)
        {
            super(props);
        }

        protected init(): void
        {
            console.log("MixedControlClass.init!", this.props)
        }
    }

    const mixedControl = new MixedControl({
        foo: 'baz',
        mixin1: 'test',
    });

    mixedControl.on('mixin1Event', (data) => { console.log('on:mixin1Event', mixedControl.props.bar, data.x) });
    mixedControl.on('mixin2Event', () => { /* handle */ });
    mixedControl.emit('mixin1Event', { x: 123 });

    console.log(mixedControl.mixin1Method());  // Outputs: foo
    console.log(mixedControl.mixin2Method());  // Outputs: bar

    const PlainBase = Control({
        id: 'plainTest',
        defaultProps: {
            foo: 'bar',
            bar: 1,
        },
        template: '<div></div>'
    });

    class PlainControl extends PlainBase
    {
        constructor(props: Partial<Props<typeof PlainBase>>)
        {
            super(props);
        }

        protected init(): void
        {
            console.log("PlainControlClass.init!", this.props)
        }
    }

    const plainControl = new PlainControl({
        foo: 'baz',
    });

    plainControl.on('someEvent', () => { /* handle */ });
}