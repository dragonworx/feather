/* eslint-disable @typescript-eslint/no-explicit-any */

export type Constructor<T, PropsType = any> = new (props?: Partial<PropsType>) => T;

export interface CustomEventListener<T = any>
{
    (evt: CustomEvent<T>): void;
}


type TestProps = {
    prop1: string;
};

type TestAttributes = {
    attrib1: { default: 0 };
};

type TestEvents = {
    event1: { x: number };
}

class BaseControl<
    PropsType,
    AttribsType,
    EventsType,
> extends HTMLElement {
    public props: PropsType;
    private _listeners: Map<string, CustomEventListener[]> = new Map(); // track custom event listeners internally

    constructor(props: Partial<PropsType> = {})
    {
        super();

        this.props = props as PropsType;
    }

    public get attribs(): AttribsType
    {
        return {} as AttribsType;
    }

    private listenersForType(type: string)
    {
        if (!this._listeners.has(type))
        {
            this._listeners.set(type, []);
        }
        return this._listeners.get(type)!;
    }

    public on = (<T extends EventsType>() =>
        <E extends keyof T>(
            type: E,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);
            this.listenersForType(key).push(listener);
            this.addEventListener(key, listener as EventListenerOrEventListenerObject, options);

            return this;
        })();
}

class TestControl extends BaseControl<TestProps, TestAttributes, TestEvents>
{
    public test() {
        //
    }
}

type AttributeType = string | number | boolean;
type AttributeValidator = (value: string) => boolean;
interface Attribute {
    value: AttributeType;
    validator?: AttributeValidator;
}

interface Descriptor<PropsType, AttribsType> {
    tagName: string;
    props?: PropsType;
    attribs?: Record<keyof AttribsType, Attribute>;
}

function Ctrl<
    PropsType, 
    AttribsType, 
    EventsType,
>(
    descriptor: Descriptor<PropsType, AttribsType>,
    ctor: Constructor<BaseControl<PropsType, AttribsType, EventsType>, PropsType>
) {
    type CtorType = typeof ctor;

    const { tagName } = descriptor;

    customElements.define(tagName, ctor);

    return class
    {
        constructor(props: Partial<PropsType> = {})
        {
            String(props); // <-- todo, just to satisfy eslint for now
            const element = document.createElement(tagName) as InstanceType<CtorType>;

            return element;
        }
    } as unknown as new (props?: Partial<PropsType>) => InstanceType<CtorType>;
}

const CtrlTest = Ctrl<TestProps, TestAttributes, TestEvents>({
    tagName: 'test',
    props: {
        prop1: 'foo',
    },
    attribs: {
        attrib1: { value: 1 },
    },
}, TestControl);

const test = new CtrlTest();
test.props.prop1 = "foo"; // <-- this should work, props are strongly typed
test.attribs.attrib1 = 1; // <-- this should work, attributes are strongly typed
test.on('event1', (evt) => {console.log(evt.detail.x)}); // <-- this should work, events are strongly typed