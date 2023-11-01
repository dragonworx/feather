import { Ctrl } from './builder';
import { Control } from './control';

/** Example Control */
export type ButtonProps = {
    x: number;
    y: number;
};

export type ButtonEvents = {
    event1: { foo: string };
}

/** Create an instantiable Control */
export const Button = Ctrl(class extends Control<ButtonProps, keyof ButtonEvents>
{
    constructor()
    {
        super();
    }

    protected mount(): void
    {
        console.log("mount")
        this.addEventListener('click', () => console.log(this.props));
    }

    protected unmount(): void
    {
        console.log("unmount!");
    }

    /** do a test */
    public test() { }
}, {
    tagName: 'button',
    props: {
        x: 0,
        y: 0,
    },
    classes: ['test'],
    watchAttributes: ['size'],
});