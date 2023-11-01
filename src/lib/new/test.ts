/* eslint-disable @typescript-eslint/no-explicit-any */

import { html } from './util';

export function test()
{
    type EventDescriptor = {
        [key: string]: object;
    };

    type EventHandler<T = any> = (event: T) => void;

    type MixinFunction<PropsType extends object, Api extends object, EventType extends EventDescriptor> =
        (control: ControlBase<PropsType, EventType>) => Mixin<PropsType, Api>;

    type Mixin<PropsType extends object = object, Api = object> = {
        id: string;
        defaultProps: PropsType;
        public: Api;
    };

    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

    type MixinsApi<M extends Array<MixinFunction<any, any, any>>> = UnionToIntersection<{
        [K in keyof M]: ReturnType<M[K]> extends Mixin<any, infer Api> ? Api : never;
    }[number]>;

    function createMixin<PropsType extends object, Api extends object, EventType extends EventDescriptor>(
        mixinFunc: (control: ControlBase<PropsType, EventType>) => { id: string; public: Api; defaultProps: PropsType }
    ): MixinFunction<PropsType, Api, EventType>
    {
        return mixinFunc;
    }

    interface Descriptor<PropsType extends object, M extends Array<MixinFunction<any, any, any>> | undefined>
    {
        id: string;
        defaultProps: PropsType;
        template: HTMLElement | string;
        mixins: M;
    }

    type OptionalDescriptor<P extends object, M extends Array<MixinFunction<any, any, any>> | undefined> = Partial<Descriptor<P, M>>;

    function Desc<P extends object, M extends Array<MixinFunction<any, any, any>> | undefined>(desc: OptionalDescriptor<P, M> & { mixins: M }): Descriptor<P, M>;
    function Desc<P extends object>(desc: OptionalDescriptor<P, undefined>): Descriptor<P, undefined>;
    function Desc<P extends object, M extends Array<MixinFunction<any, any, any>> | undefined>(desc: OptionalDescriptor<P, M>): Descriptor<P, M> {
        return {
            mixins: [],
            ...desc,
        } as unknown as Descriptor<P, M>;
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
        protected element: HTMLElement;

        constructor(props: Partial<P> = {}, element: HTMLElement)
        {
            this.props = props as P;
            this.element = element;
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
                }, descriptor.template instanceof HTMLElement ? descriptor.template : html(descriptor.template));

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

    // ----------------------------------------------

    // Example Mixin1
    const mixin1 = createMixin((control: ControlBase<{
        mixin1: string
    }, {
        mixin1Event: { x: number };
    }>) =>
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
        };
    });

    // Example Mixin2
    const mixin2 = createMixin((control: ControlBase<{
        mixin2: string
    }, {
        mixin2Event: { y: string };
    }>) =>
    {
        console.log('mixin2', control, control.props);

        return {
            id: 'mixin2',
            defaultProps: { mixin2: 'mixin2' },
            public: {
                mixin2Method()
                {
                    control.emit('mixin2Event', { y: '456' });
                    return 'bar';
                },
            },
        };
    });

    // Example Control
    const mixedDescriptor = Desc({
        id: 'test',
        defaultProps: {
            foo: 'bar',
            bar: 1,
        },
        template: '<div></div>',
        mixins: [mixin1, mixin2],
    });
    const MixedBase = Control(mixedDescriptor);

    const mixedControl = new MixedBase({
        foo: 'baz',
        mixin1: 'test',
    });

    mixedControl.on('mixin1Event', (data) => { console.log('on:mixin1Event', mixedControl.props.bar, data.x) });
    mixedControl.on('mixin2Event', () => { /* handle */ });
    mixedControl.emit('mixin1Event', { x: 123 });

    console.log(mixedControl.mixin1Method());  // Outputs: foo
    console.log(mixedControl.mixin2Method());  // Outputs: bar

    // const plainDescriptor = Desc({
    //     id: 'plainTest',
    //     defaultProps: {
    //         efg: 'bar',
    //         xyz: 1,
    //     },
    //     template: '<div></div>',
    // });
    // const PlainBase = Control(plainDescriptor);

    // const plainControl = new PlainBase({
    //     xyz: 2,
    // });

    // plainControl.on('fd', () => { /* handle */ });
}