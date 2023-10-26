import { getDescriptors } from '../util';

export function test()
{
    /* eslint-disable @typescript-eslint/no-explicit-any */
    interface IDescriptor<T>
    {
        id: string;
        props: T;
    }

    /** Base class for all controls */
    class Control<P extends object = object> {
        public props: P;

        public static descriptor: IDescriptor<object> = {
            id: 'control',
            props: {},
        };

        constructor(props?: Partial<P>)
        {
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
    }

    interface SubProps { subControlProp: string }

    /** Example sub control */
    class SubControl extends Control<SubProps> {
        public static descriptor: IDescriptor<SubProps> = {
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
    class Behavior
    {
        constructor()
        {
            console.log('behavior constructor');
        }

        protected get control() {
            return this as unknown as Control;
        }

        public behaviorMethod()
        {
            console.log('behavior method');
        }
    }

    /** Example behavior 1 */
    class Behavior1 extends Behavior
    {
        constructor() {
             super();
              console.log('behavior1 constructor');
             }

        public behavior1Method()
        {
            console.log('behavior1 method');
        }
    }

    /** Example behavior 2 */
    class Behavior2 extends Behavior
    {
        constructor() { 
            super(); 
            console.log('behavior1 constructor'); 
        }
        
        public behavior2Method()
        {
            console.log('behavior2 method', this.control.props);
        }
    }

    type SimpleConstructor<T = object> = new (...args: any[]) => T;
    type Constructor<T = object, P = object> = new (props?: P) => T;
    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

    function withBehaviors<
        T extends Control<P>,
        P extends object,
        B extends SimpleConstructor<Behavior>[]
    >(
        ControlClass: Constructor<T, P> & { descriptor: IDescriptor<P> },
        ...behaviors: B
    )
    {
        return class extends (ControlClass as any) {
            public static descriptor: IDescriptor<P> = ControlClass.descriptor;
            
            constructor(props: P)
            {
                super(props);

                for (const BehaviorClass of behaviors)
                {
                    let behaviorProto = Object.getPrototypeOf(new BehaviorClass());

                    while (behaviorProto && behaviorProto !== Object.prototype)
                    {
                        for (const key of Object.getOwnPropertyNames(behaviorProto))
                        {
                            if (key !== 'constructor' && typeof behaviorProto[key] === 'function')
                            {
                                this[key] = behaviorProto[key].bind(this);
                            }
                        }
                        behaviorProto = Object.getPrototypeOf(behaviorProto);
                    }
                }
            }
        } as Constructor<T & UnionToIntersection<InstanceType<B[number]>>, P> & { descriptor: IDescriptor<P> };
    }

    const SubControlWithBehaviors = withBehaviors(SubControl, Behavior1, Behavior2);

    const subControl = new SubControlWithBehaviors();

    subControl.controlMethod(); // <-- works
    subControl.subControlMethod(); // <-- works
    subControl.behaviorMethod(); // <-- works
    subControl.behavior1Method(); // <-- works
    subControl.behavior2Method(); // <-- works
    (window as any).subControl = subControl;
    console.log(subControl);
}