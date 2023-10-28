/* eslint-disable @typescript-eslint/no-explicit-any */

import { Behavior } from './behavior';
import { Control, type ControlDescriptor, type EventHandler } from './control';
import { Mixin } from './util';

export function test()
{
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
            console.log('behavior1 method', this._props, this.controlProtectedMethod());
        }

        public get foo()
        {
            return 4
        }
    }

    interface Behavior2Event
    {
        x: string;
    }

    type BehaviorEvent = 'test';

    /** Example behavior 2 */
    class Behavior2 extends Behavior
    {
        constructor()
        {
            super();
            console.log('behavior2 constructor');
        }

        public behavior2Method()
        {
            console.log('behavior2 method', this._props);
        }

        public get behavior2Prop()
        {
            return 'behavior2 prop';
        }

        public onTest(listener: EventHandler<Behavior2Event>)
        {
            return this.on<BehaviorEvent>('test', listener);
        }
    }

    /** Example sub control */
    interface SubProps { subControlProp: string }

    class SubControl extends Control<SubProps> {
        public static descriptor: ControlDescriptor<SubProps> = {
            id: 'subControl',
            props: {
                subControlProp: 'sub control prop',
            },
        };

        constructor(props?: Partial<SubProps>)
        {
            super(props);
            console.log('sub control constructor');
        }

        public subControlMethod()
        {
            console.log('sub control method');
        }
    }

    const SubControlWithBehaviors = Mixin(SubControl, Behavior1, Behavior2);

    class SubSubControl extends SubControlWithBehaviors
    {
        public static descriptor: ControlDescriptor<SubProps> = {
            ...SubControl.descriptor,
            id: 'subSubControl',
        };

        constructor(props?: Partial<SubProps>)
        {
            super(props);
            console.log('sub sub control constructor');
        }
    }

    const subControl = new SubControlWithBehaviors({ subControlProp: 'foo2' });
    // const subControl2 = new SubSubControl({ subControlProp: 'foo3' });

    console.log('----------');

    // subControl.testWrite('foo1', 'bar1');
    // // subControl2.testWrite('foo2', 'bar2');

    // subControl.controlMethod(); // <-- works
    // subControl.subControlMethod(); // <-- works
    // subControl.behaviorMethod(); // <-- works
    // subControl.behavior1Method(); // <-- works
    // subControl.behavior2Method(); // <-- works
    // subControl.onTest((value) =>
    // {
    //     console.log(`test event: ${value.x}`)
    // });

    // console.log(subControl.behavior2Prop); // <-- works
    // console.log(subControl.testRead('foo1')); // <-- works
    // // console.log(subControl2.testRead('foo2')); // <-- works

    (window as any).subControl = subControl;
    console.log(subControl);

    subControl.mount();

    setTimeout(() =>
    {
        subControl.emit<Behavior2Event>('test', { x: 'xxx' });
        subControl.unmount();
    }, 1000)
}
