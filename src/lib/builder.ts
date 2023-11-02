import type { Constructor, Control, Descriptor, WithAttributes, WithDescriptor, WithFullTagname, WithProps } from './control';
import { toHyphenCase } from './util';

export const tagPref = 'ctrl-';

export type Writable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };

/** Custom Element registration function */
export function Ctrl<P extends object, C extends Constructor<Control<P>>>(
    htmlElementCtor: C,
    descriptor: Descriptor<P>
)
{
    console.log("Build", htmlElementCtor.name, descriptor);

    const { tagName, watchAttributes } = descriptor;
    const fullTagName = tagPref + (tagName ?? toHyphenCase(htmlElementCtor.name));

    if (fullTagName.endsWith('-') || fullTagName.startsWith('-'))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    /** Initialise Custom Class */
    (htmlElementCtor as unknown as WithDescriptor).__descriptor = descriptor;
    (htmlElementCtor as unknown as WithFullTagname).fullTagName = fullTagName;
    watchAttributes && ((htmlElementCtor as unknown as WithAttributes).observedAttributes = watchAttributes);

    customElements.define(fullTagName, htmlElementCtor);

    /** Custom Class Instantiating */
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