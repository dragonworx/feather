/* eslint-disable @typescript-eslint/no-explicit-any */

import { Behavior } from './behavior';
import { Control, type ControlDescriptor } from './control';
import { Mixin } from './util';

/** Test Control Props */
export type TestControlProps = {
    foo: string;
    bar: number;
}

type TestControlState = { testControl: string; }

/** Test Control */
export class TestControl<P> extends Control<TestControlProps & P>
{
    protected testControlState: TestControlState;

    constructor(props?: Partial<TestControlProps & P>)
    {
        super(props);

        this.testControlState = { testControl: 'testControl' };
    }

    public static descriptor: ControlDescriptor<TestControlProps> = {
        id: 'test',
        props: {
            foo: 'bar',
            bar: 1,
        },
        template: '<div></div>',
    };

    private privateTestControlMethod()
    {
        return 'privateTestControlMethod:' + this.testControlState.testControl;
    }

    protected protectedTestControlMethod()
    {
        return 'protectedTestControlMethod:' + this.privateTestControlMethod();;
    }

    public publicTestControlMethod()
    {
        return 'publicTestControlMethod:' + this.protectedTestControlMethod();
    }
}

/** Sub Control Props  */
export type SubControlProps = TestControlProps & {
    baz: boolean;
}

type SubControlState = { subControl: string; }

/** Sub Control */
export class SubControl extends TestControl<SubControlProps>
{
    protected subControlState: SubControlState;

    constructor(props?: Partial<SubControlProps>)
    {
        super(props);

        this.subControlState = { subControl: 'subControl' };
    }

    public static descriptor: ControlDescriptor<SubControlProps> = {
        id: 'sub',
        props: {
            ...TestControl.descriptor.props,
            baz: true,
        },
        template: '<div></div>',
    };

    private privateSubControlMethod()
    {
        return 'privateSubControlMethod:' + this.subControlState.subControl;
    }

    protected protectedSubControlMethod()
    {
        return 'protectedSubControlMethod:' + this.privateSubControlMethod();
    }

    public publicSubControlMethod()
    {
        return 'publicSubControlMethod:' + this.protectedSubControlMethod();
    }
}

type TestBehavior1State = { behavior1: string; }

/** Test Behavior 1 */
export class TestBehavior1 extends Behavior
{
    protected testBehavior1State: TestBehavior1State;

    constructor()
    {
        super();

        this.testBehavior1State = { behavior1: 'behavior1' };
    }

    private privateBehavior1Method()
    {
        return 'privateBehavior1Method:' + this.testBehavior1State.behavior1;
    }

    protected protectedBehavior1Method()
    {
        return 'protectedBehavior1Method:' + this.privateBehavior1Method();
    }

    public publicBehavior1Method()
    {
        return 'publicBehavior1Method:' + this.protectedBehavior1Method();
    }
}

type TestBehavior2State = { behavior2: string; }

/** Test Behavior 2 Event type */
export interface TestBehavior2Event
{
    x: string;
}

/** Test Behavior 2 Event types */
export type TestBehaviorEvent = 'test';


/** Test Behavior 2 */
export class TestBehavior2 extends Behavior
{
    protected testBehavior2State: TestBehavior2State;

    constructor()
    {
        super();

        this.testBehavior2State = { behavior2: 'behavior2' };
    }

    private privateBehavior2Method()
    {
        return 'privateBehavior2Method:' + this.testBehavior2State.behavior2;
    }

    protected protectedBehavior2Method()
    {
        return 'protectedBehavior2Method:' + this.privateBehavior2Method();
    }

    public publicBehavior2Method()
    {
        return 'publicBehavior2Method:' + this.protectedBehavior2Method();
    }
}

/** Test Mixin */
export const SubControlWithBehaviors = Mixin(SubControl, TestBehavior1, TestBehavior2)


export function test()
{
    const control = new SubControlWithBehaviors();
    console.log(control.publicTestControlMethod())
    debugger
}
