/* eslint-disable @typescript-eslint/no-explicit-any */
export function test()
{


    /** Base class for all controls */
    class Control<P extends object = object> {
        // public props: P;

        constructor(props?: Partial<P>)
        {
            // if (this instanceof Behavior)
            // {
            //     this.props = {} as P;
            //     return
            // }

            console.log('control constructor');

            // const descriptors = getDescriptors(this.constructor as any);

            // const descriptor = descriptors[descriptors.length - 1] as any;

            // this.props = {
            //     ...descriptor.props,
            //     ...props,
            // };
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

    // function findPropertyDescriptorInProtoChain(obj: object, key: string | symbol): PropertyDescriptor | null
    // {
    //     let currentProto = Object.getPrototypeOf(obj);

    //     while (currentProto !== null)
    //     {
    //         const descriptor = Object.getOwnPropertyDescriptor(currentProto, key);
    //         if (descriptor)
    //         {
    //             return descriptor;
    //         }
    //         currentProto = Object.getPrototypeOf(currentProto);
    //     }

    //     return null;
    // }

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

    interface ControlDescriptor<E extends HTMLElement = HTMLElement, P extends object = object>
    {
        id: string;
        props: P;
        baseElement: new (...args: any[]) => E;
        tagName: string;
    }

    type ControlCtor<E extends HTMLElement = HTMLElement, P extends object = object> = new (props?: P) => E & Control<P>;
    type ControlCtorWithDescriptor<E extends HTMLElement = HTMLElement, P extends object = object> = ControlCtor<E, P> & { descriptor: ControlDescriptor<E, P> };

    // Higher-order function to mix in Control functionalities
    function createControlClass<E extends HTMLElement, P extends object>(
        descriptor: ControlDescriptor<E, P>
    ): ControlCtor<E, P>
    {
        const Cls = class extends (descriptor.baseElement as any) {
            constructor(...args: any[])
            {
                super(...args);

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
        } as ControlCtor<E, P>;

        (Cls as ControlCtorWithDescriptor<E, P>).descriptor = descriptor;

        return Cls;
    }

    function registerControl<E extends HTMLElement = HTMLElement, P extends object = object>(ctor: ControlCtor<E, P>)
    {
        const descriptor = (ctor as ControlCtorWithDescriptor<E, P>).descriptor;
        customElements.define(`ctrl-${descriptor.id.toLowerCase()}`, ctor, { extends: descriptor.tagName });
    }


    // Extend the new HTMLDivControl class
    class SubControl extends createControlClass({
        id: 'subControl',
        props: {
            subControlProp: 'sub control prop',
        },
        baseElement: HTMLDivElement,
        tagName: 'div'
    })
    {
        constructor(props?: SubProps)
        {
            super(props);

            this.test();
            // this.props.subControlProp = 'foo';
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

    // customElements.define('custom-foo', SubControl, { extends: 'div' }); // <-- this works

    registerControl(SubControl);

    const control = new SubControl({ subControlProp: 'foo' });


    setTimeout(() =>
    {
        document.body.appendChild(control);
        control.test();
        debugger
    }, 100)
}