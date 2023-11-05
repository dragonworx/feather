import { Ctrl } from './builder';
import { Control, css } from './control';
import type { DiffSet } from './diff';
import { randRgb } from './util';

/** Example Control */
export type TestProps = {
    x: number;
    y: boolean;
    z: string;
};

export type TestEvents = {
    event1: { foo: string };
    event2: { bar: number };
    event3: null;
}

/** Create an instantiable Control */
export default Ctrl({
    tagName: 'test',
    props: {
        x: 0,
        y: true,
        z: "foo"
    },
    classes: ['test'],
}, class Test extends Control<TestProps, TestEvents>
{
    private _color = 'rgb(0,255,0)'

    protected mount(): void
    {
        console.log("test mount")
        this.addEventListener('click', () => this.render());
    }

    protected unmount(): void
    {
        console.log("test unmount!");
    }

    /** do a test */
    public test()
    {
        this._color = randRgb();
        this.render();
    }

    protected renderHtml(): string | void
    {
        return `
            <div><span>x: ${this._props.x}</span></div>
            <div><span>y: ${this._props.y}</span></div>
            <div><span>z: ${this._props.z}</span></div>
        `;
    }

    protected renderCss(): string | void
    {
        console.log("!")
        return css`
            div {
                color: red;
                background: ${this._color};

                span {
                    border-bottom: 5px solid green;
                }
            }
        `;
    }

    protected onPropsChanged(diff: DiffSet): void
    {
        super.onPropsChanged(diff);

        this.render();
    }
});
