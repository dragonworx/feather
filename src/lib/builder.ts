import type { Constructor, Control, WithAttributes, WithFullTagname, WithProps } from './control';
import { toHyphenCase } from './util';

export const tagPref = 'ctrl-';

export interface Descriptor<PropsType extends object = object>
{
    tagName?: string;
    props: PropsType;
    classes?: string[];
    template?: HTMLElement | string;
    attributes?: string[];
}
export type WithDescriptor = { __descriptor: Descriptor };
export type Writable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };

/** Custom Element registration function */
export function Ctrl<P extends object, C extends Constructor<Control<P>>>(
    descriptor: Descriptor<P>,
    htmlElementCtor: C,
)
{
    console.log("*** Ctrl ***", htmlElementCtor.name, descriptor);

    const { tagName, attributes: watchAttributes } = descriptor;
    const fullTagName = tagPref + (tagName ?? toHyphenCase(htmlElementCtor.name));

    if (fullTagName.endsWith('-') || fullTagName.startsWith('-'))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    /** Initialise Custom Class */
    (htmlElementCtor as unknown as WithDescriptor).__descriptor = descriptor;
    (htmlElementCtor as unknown as WithFullTagname).fullTagName = fullTagName;

    /** Initialise Attributes */
    const observedAttributes: string[] = [...watchAttributes ?? []];
    for (const key in descriptor.props)
    {
        if (!observedAttributes.includes(key))
        {
            observedAttributes.push(toHyphenCase(key));
        }
    }

    (htmlElementCtor as unknown as WithAttributes).observedAttributes = observedAttributes;

    /** Define Custom Element */
    customElements.define(fullTagName, htmlElementCtor);

    /** Return Custom Class Constructor */
    return class
    {
        constructor(props: Partial<P> = {})
        {
            const element = document.createElement(fullTagName) as InstanceType<C>;

            (element as unknown as WithProps).initialProps = props;

            return element;
        }
    } as unknown as new (props: Partial<P>) => InstanceType<C>;
}