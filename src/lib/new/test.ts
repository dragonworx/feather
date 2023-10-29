/* eslint-disable @typescript-eslint/no-explicit-any */

export function test()
{
    type EventHandler<T = any> = (event: T) => void;

    type MixinFunction<PropsType extends object, Api extends Record<string, any>, EventType extends string> =
        (control: ControlBase<PropsType, EventType>) => Mixin<PropsType, Api, EventType>;

    type Mixin<PropsType extends object = object, Api extends Record<string, any> = object, EventType extends string = string> = {
        id: string;
        defaultProps: PropsType;
        public: Api;
        events: EventType[];
    };

    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

    type MixinsApi<M extends Array<MixinFunction<any, any, any>>> = UnionToIntersection<{
        [K in keyof M]: ReturnType<M[K]> extends Mixin<any, infer Api, any> ? Api : never;
    }[number]>;

    type MixinsEvents<M extends Array<MixinFunction<any, any, any>>> = ReturnType<M[number]>['events'][number];

    interface Descriptor<PropsType extends object, M extends Array<MixinFunction<any, any, any>> | undefined>
    {
        id: string;
        defaultProps: PropsType;
        template: string;
        mixins?: M;
    }

    function Control<P extends object>(desc: Omit<Descriptor<P, undefined>, 'mixins'>): new (props: Partial<P>) => ControlBase<P, string>;
    function Control<P extends object, M extends Array<MixinFunction<any, any, any>>>(desc: Descriptor<P, M>): new (props: Partial<P & UnionToIntersection<ReturnType<M[number]>['defaultProps']>>) => ControlBase<P & UnionToIntersection<ReturnType<M[number]>['defaultProps']>, MixinsEvents<M>> & MixinsApi<M>;
    function Control<P extends object, M extends Array<MixinFunction<any, any, any>> | undefined>(desc: Descriptor<P, M>)
    {
        return createMixedControlClass(desc);
    }

    abstract class ControlBase<P extends object, E extends string = string> {
        private _eventHandlers: Record<string, EventHandler[]> = {};
        public props: P;

        constructor(props: Partial<P> = {})
        {
            this.props = props as P;
        }

        on<T = any>(event: E, handler: EventHandler<T>): void
        {
            if (!this._eventHandlers[event])
            {
                this._eventHandlers[event] = [];
            }
            this._eventHandlers[event].push(handler);
        }

        emit<T = any>(event: E, data?: T): void
        {
            if (this._eventHandlers[event])
            {
                this._eventHandlers[event].forEach((handler) => handler(data));
            }
        }

        protected init()
        {
            //
        }
    }

    function createMixedControlClass<P extends object, M extends Array<MixinFunction<any, any, any>> | undefined>(descriptor: Descriptor<P, M>)
    {
        type MixedProps = M extends undefined ? P : (P & UnionToIntersection<ReturnType<NonNullable<M>[number]>['defaultProps']>);
        type MixedEvents = M extends undefined ? string : MixinsEvents<NonNullable<M>>;
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
        } as unknown as (new (props: Partial<MixedProps>) =>
            ControlBase<MixedProps, MixedEvents>
            & MixedApi
            & {
                on: <T = any>(event: MixedEvents, handler: EventHandler<T>) => void;
                emit: <T = any>(event: MixedEvents, data?: T) => void;
            });
    }

    type Props<T> = T extends new (props: infer P) => any ? P : never;

    // Example Mixin1
    type Mixin1Props = { mixin1: string };
    type Mixin1Public = { mixin1Method(): string };
    type Mixin1Events = {
        mixin1Event: { x: number };
    }

    const mixin1: MixinFunction<
        Mixin1Props,
        Mixin1Public,
        keyof Mixin1Events
    > = (control) =>
        {
            console.log('mixin1', control, control.props);

            return {
                id: 'mixin1',
                defaultProps: { mixin1: 'mixin1' },
                public: {
                    mixin1Method()
                    {
                        control.emit<Mixin1Events['mixin1Event']>('mixin1Event', { x: 123 });
                        return 'foo';
                    },
                },
                events: ['mixin1Event'],
            };
        };

    // Example Mixin2
    const mixin2: MixinFunction<
        { mixin2: string },
        { mixin2Method(): string },
        'mixin2Event'
    > = (control) =>
        {
            console.log('mixin2', control, control.props);

            return {
                id: 'mixin2',
                defaultProps: { mixin2: 'mixin2' },
                public: {
                    mixin2Method()
                    {
                        return 'bar';
                    },
                },
                events: ['mixin2Event'],
            };
        };

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

    mixedControl.on<Mixin1Events['mixin1Event']>('mixin1Event', (data) => { console.log('on:mixin1Event', data.x) });
    mixedControl.on('mixin2Event', () => { /* handle */ });

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

    debugger;
}
