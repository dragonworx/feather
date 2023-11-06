import { Ctrl } from './builder';
import { Control, css } from './control';
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
        this.addEventListener('click', (e) => this.test(e));
    }

    /** do a test */
    public test(e: MouseEvent)
    {
        e.shiftKey && (this._color = randRgb());
        e.altKey && this.remove();
        this.applyStyle();
    }

    protected html(): string | void
    {
        return `
            <div><span>x: ${this._props.x}</span></div>
            <div><span>y: ${this._props.y}</span></div>
            <div><span>z: ${this._props.z}</span></div>
        `;
    }

    protected css(): string | void
    {
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
});
