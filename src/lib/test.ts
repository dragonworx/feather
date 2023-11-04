import { Ctrl } from './builder';
import { Control } from './control';

/** Example Control */
export type TestProps = {
    x: number;
    y: number;
};

export type TestEvents = {
    event1: { foo: string };
    event2: { bar: number };
    event3: null;
}

/** Create an instantiable Control */
export const Test = Ctrl({
    tagName: 'test',
    props: {
        x: 0,
        y: 0,
    },
    classes: ['test'],
    attributes: ['size'],
}, class Test extends Control<TestProps, TestEvents>
{
    constructor()
    {
        super();
    }

    protected mount(): void
    {
        console.log("test mount")
        this.addEventListener('click', () => console.log(this.props));
    }

    protected unmount(): void
    {
        console.log("test unmount!");
    }

    /** do a test */
    public test() { }
});
