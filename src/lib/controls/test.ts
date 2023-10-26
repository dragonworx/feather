import { getDescriptors } from '../util';

export function test()
{
    /* eslint-disable @typescript-eslint/no-explicit-any */
    interface ControlDescriptor<T>
    {
        id: string;
        props: T;
    }

    /** Base class for all controls */
    class Control<P extends object = object> {
        public props: P;

        public static descriptor: ControlDescriptor<object> = {
            id: 'control',
            props: {},
        };

        constructor(props?: Partial<P>)
        {
            if (this instanceof Behavior)
            {
                this.props = {} as P;
                return
            }

            console.log('control constructor');

            const descriptors = getDescriptors(this.constructor as any);

            const descriptor = descriptors[descriptors.length - 1] as any;

            this.props = {
                ...descriptor.props,
                ...props,
            };
        }

        public controlMethod()
        {
            console.log('control method');
        }

        protected controlProtectedMethod()
        {
            return "foo23"
        }

        public get foo()
        {
            return 3
        }

        public set foo(value: number)
        {
            console.log('SET', value);
        }

        public get bar()
        {
            return 3
        }

        public set bar(value: number)
        {
            console.log('SET2', value);
        }
    }

    interface SubProps { subControlProp: string }

    /** Example sub control */
    class SubControl extends Control<SubProps> {
        public static descriptor: ControlDescriptor<SubProps> = {
            id: 'subControl',
            props: {
                subControlProp: 'sub control prop',
            },
        };

        constructor(props: Partial<SubProps> = {})
        {
            super(props);
            console.log('sub control constructor');
        }

        public subControlMethod()
        {
            console.log('sub control method');
        }
    }

    /** Base class for all behaviors */
    class Behavior extends Control
    {
        constructor()
        {
            super();
            console.log('behavior constructor');
        }

        public behaviorMethod()
        {
            console.log('behavior method');
        }
    }

    /** Example behavior 1 */
    class Behavior1 extends Behavior
    {
        constructor()
        {
            super();
            console.log('behavior1 constructor');
        }

        public behavior1Method()
        {
            console.log('behavior1 method', this.props, this.controlProtectedMethod());
        }

        public get foo()
        {
            return 4
        }
    }

    /** Example behavior 2 */
    class Behavior2 extends Behavior
    {
        constructor()
        {
            super();
            console.log('behavior1 constructor');
        }

        public behavior2Method()
        {
            console.log('behavior2 method', this.props);
        }
    }

    type GeneralCtor<T = object> = new (...args: any[]) => T;
    type ControlCtor<T = object, P = object> = new (props?: P) => T;
    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

    function withBehaviors<
        T extends Control<P>,
        P extends object,
        B extends GeneralCtor<Behavior>[]
    >(
        ControlClass: ControlCtor<T, P> & { descriptor: ControlDescriptor<P> },
        ...behaviors: B
    )
    {
        return class extends (ControlClass as any) {
            public static descriptor: ControlDescriptor<P> = ControlClass.descriptor;

            constructor(props: P)
            {
                super(props);

                for (const BehaviorClass of behaviors)
                {
                    let behaviorProto = Object.getPrototypeOf(new BehaviorClass());

                    while (behaviorProto && behaviorProto !== Object.prototype)
                    {
                        const propertyDescriptors = Object.getOwnPropertyDescriptors(behaviorProto);

                        for (const [key, property] of Object.entries(propertyDescriptors))
                        {
                            if (key === 'constructor')
                            {
                                continue;
                            }

                            const currentProperty = findPropertyDescriptorInProtoChain(this, key);

                            if (typeof property.value === 'function')
                            {
                                this[key] = property.value.bind(this);
                            } else if ('get' in property)
                            {
                                if (typeof property.get === 'function')
                                {
                                    Object.defineProperty(this, key, {
                                        get: property.get!.bind(this),
                                        set: currentProperty?.set,
                                        enumerable: true,
                                        configurable: true,
                                    });
                                } else
                                {
                                    Object.defineProperty(this, key, {
                                        get: property.value,
                                        set: currentProperty?.set,
                                        enumerable: true,
                                        configurable: true,
                                    });
                                }
                            }
                            if (property.set)
                            {
                                Object.defineProperty(this, key, {
                                    get: currentProperty?.get,
                                    set: property.set!.bind(this),
                                    enumerable: true,
                                    configurable: true,
                                });
                            }
                        }

                        behaviorProto = Object.getPrototypeOf(behaviorProto);
                    }
                }
            }
        } as ControlCtor<T & UnionToIntersection<InstanceType<B[number]>>, P> & { descriptor: ControlDescriptor<P> };
    }

    function findPropertyDescriptorInProtoChain(obj: object, key: string | symbol): PropertyDescriptor | null
    {
        let currentProto = Object.getPrototypeOf(obj);

        while (currentProto !== null)
        {
            const descriptor = Object.getOwnPropertyDescriptor(currentProto, key);
            if (descriptor)
            {
                return descriptor;
            }
            currentProto = Object.getPrototypeOf(currentProto);
        }

        return null;
    }

    function getBoundPropertyDescriptor(object: any, property: TypedPropertyDescriptor<any>)
    {
        const prop: TypedPropertyDescriptor<any> = {
            ...property,
            enumerable: true,
            configurable: true,
        };

        if (typeof prop.get === 'function')
        {
            prop.get = prop.get.bind(object);
        }
        if (typeof prop.set === 'function')
        {
            prop.set = prop.set.bind(object);
        }
        if (typeof prop.value === 'function')
        {
            prop.value = prop.value.bind(object);
        }

        return prop;
    }

    // Higher-order function to mix in Control functionalities
    function createControlClass<E extends HTMLElement>(
        BaseElement: any
    ): new (...args: any[]) => E & Control
    {
        return class extends BaseElement
        {
            constructor(...args: any[])
            {
                super(args);

                const propertyDescriptors = Object.getOwnPropertyDescriptors(Control.prototype);

                for (const [key, property] of Object.entries(propertyDescriptors))
                {
                    if (key === 'constructor')
                    {
                        continue;
                    }

                    Object.defineProperty(this, key, getBoundPropertyDescriptor(this, property));
                }
            }

            // Proxy any other functionalities from Control you need
        } as unknown as new (...args: any[]) => E & Control;
    }

    const HTMLDivControl = createControlClass(HTMLDivElement);

    // Extend the new HTMLDivControl class
    class MyControl extends HTMLDivControl
    {
        constructor()
        {
            super();

            this.test();
        }

        public test()
        {
            console.log("TESTING");
            this.controlMethod();
            console.log(this.foo, this.bar);
            this.innerHTML = 'foo';
            (window as any).foo = this;
        }
    }

    customElements.define('custom-foo', MyControl, { extends: 'div' });


    const SubControlWithBehaviors = withBehaviors(SubControl, Behavior1, Behavior2);

    const subControl = new SubControlWithBehaviors({ subControlProp: 'foo2' });

    subControl.controlMethod(); // <-- works
    subControl.subControlMethod(); // <-- works
    subControl.behaviorMethod(); // <-- works
    subControl.behavior1Method(); // <-- works
    subControl.behavior2Method(); // <-- works

    (window as any).subControl = subControl;
    console.log(subControl);

    const foo = new MyControl();
    
    setTimeout(() =>
    {
        document.body.appendChild(foo);
    }, 1000)
}
