import { Behavior } from '../src/lib/new/behavior';
import { Control, type ControlDescriptor } from '../src/lib/new/control';
import { Mixin } from '../src/lib/new/util';

/** Test Control Props */
export type TestControlProps = {
    foo: string;
    bar: number;
}

/** Test Control */
export class TestControl<P> extends Control<TestControlProps & P>
{
    public static descriptor: ControlDescriptor<TestControlProps> = {
        id: 'test',
        props: {
            foo: 'bar',
            bar: 1,
        },
        template: '<div></div>',
    };
}

/** Sub Control Props  */
export type SubControlProps = TestControlProps & {
    baz: boolean;
}

/** Sub Control */
export class SubControl extends TestControl<SubControlProps>
{
    public static descriptor: ControlDescriptor<SubControlProps> = {
        id: 'sub',
        props: {
            ...TestControl.descriptor.props,
            baz: true,
        },
        template: '<div></div>',
    };
}

/** Test Behavior 1 */
export class TestBehavior1 extends Behavior
{

}

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

}

/** Test Mixin */
export const SubControlWithBehaviors = Mixin(SubControl, TestBehavior1, TestBehavior2)