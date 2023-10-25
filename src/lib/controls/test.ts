/* eslint-disable @typescript-eslint/no-explicit-any */
interface IDescriptor<T> {
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

    constructor(props: P) {
        this.props = props;
    }

    public controlMethod() {
        console.log('control method');
    }
}

/** Base class for all behaviors */
class Behavior {
    public behaviorMethod() {
        console.log('behavior method');
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
    
    public subControlMethod() {
        console.log('sub control method');
    }
}

interface IBehavior1 {
    behavior1Method(): void;
}

/** Example behavior 1 */
class Behavior1 extends Behavior implements IBehavior1 {
    public behavior1Method() {
        console.log('behavior1 method');
    }
}

interface IBehavior2 {
    behavior2Method(): void;
}

/** Example behavior 2 */
class Behavior2 extends Behavior implements IBehavior2 {
    public behavior2Method() {
        console.log('behavior2 method');
    }
}

type SimpleConstructor<T = object> = new (...args: any[]) => T;
type Constructor<T = object, P = object> = new (props: P) => T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

function withBehaviors<
    T extends Control<P>,
    P extends object,
    B extends SimpleConstructor<Behavior>[]
>(
    ControlClass: Constructor<T, P> & { descriptor: IDescriptor<P> },
    ...behaviors: B
) {
    return class extends (ControlClass as any) {
        constructor(props: P) {
            super(props);
            behaviors.forEach((BehaviorClass) => {
                Object.assign(this, new BehaviorClass());
            });
        }
    } as Constructor<T & UnionToIntersection<InstanceType<B[number]>>, P>;
}

const SubControlWithBehaviors = withBehaviors(SubControl, Behavior1, Behavior2);

const subControl = new SubControlWithBehaviors({subControlProp: 'sub control prop'})
subControl.controlMethod(); // <-- works
subControl.subControlMethod(); // <-- works
subControl.behaviorMethod(); // <-- works
subControl.behavior1Method(); // <-- works
subControl.behavior2Method(); // <-- works
