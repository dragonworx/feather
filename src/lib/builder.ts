/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseControl } from './control';
import { isValidTagName, toHyphenCase } from './util';

/** ------- Types ------- */
export type Constructor<T, StateType = any> = new (state?: Partial<StateType>) => T;

export interface CustomEventListener<T = any>
{
    (evt: CustomEvent<T>): void;
}

type AttributeValidator = (value: string) => boolean;

export const attributeValidators: Record<string, AttributeValidator> = {
    string: () => true,
    number: (value) => !isNaN(Number(value)),
    boolean: (value) => { const val = String(value).toLowerCase(); return val === "true" || val === "false" },
};

export interface Descriptor<StateType extends object>
{
    tagName: string;
    classes?: string[];
    state?: StateType;
}

export type WithMeta = { _meta: ControlMeta<any> };

export type ControlMeta<
    StateType extends object,
> = {
    fullTagName: string;
    descriptor: Descriptor<StateType>;
};

/** ------- Prefixes ------- */
type Prefixes = {
    tag: string;
    css: string;
};

export const prefixes: Prefixes = {
    tag: 'ctrl',
    css: 'ctrl',
};

export function getPrefix(k: keyof Prefixes): string {
    return prefixes[k];
}

export function setPrefix(k: keyof Prefixes, v: string): void {
    if (v.trim().length) {
        prefixes[k] = v;
    }
}

export function applyPrefix(k: keyof Prefixes, v: string): string {
    return `${getPrefix(k)}-${v}`.replace(/^-/, '');
}

/** ------- Ctrl ------- */
export function Ctrl<
    StateType extends object,
    EventsType extends object = object,
>(
    descriptor: Descriptor<StateType>,
    ctor: Constructor<BaseControl<StateType, EventsType>, StateType>
)
{
    type CtorType = typeof ctor;

    const { tagName, state: descState } = descriptor;
    const fullTagName = [prefixes.tag, (tagName ?? toHyphenCase(ctor.name))].join('-');

    if (!isValidTagName(fullTagName))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    // setup custom element
    if (descState)
    {
        const observedAttributes = Object.keys(descState).map(key => toHyphenCase(key));

        (ctor as any).observedAttributes = observedAttributes;;
    }

    customElements.define(fullTagName, ctor);

    const meta: ControlMeta<StateType> = {
        fullTagName,
        descriptor,
    };

    (ctor as unknown as WithMeta)._meta = meta;

    return class
    {
        constructor(state: Partial<StateType> = {})
        {
            // create element
            const element = document.createElement(fullTagName) as InstanceType<CtorType>;

            element['_initialState'] = state;

            // return element as ctor with props
            return element;
        }
    } as unknown as new (state?: Partial<StateType>) => InstanceType<CtorType> & StateType;
}
