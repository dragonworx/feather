import type { Constructor, Control, Descriptor, WithAttributes, WithDescriptor, WithProps } from './control';
import { toHyphenCase } from './util';

export const tagPref = 'ctrl-';

/** Custom Element registration function */
export function Ctrl<P extends object, C extends Constructor<Control<P>>>(
    htmlElementCtor: C,
    descriptor: Descriptor<P>
)
{
    const { tagName, watchAttributes } = descriptor;
    const fullTagName = tagPref + (tagName ?? toHyphenCase(htmlElementCtor.name));

    if (fullTagName.endsWith('-') || fullTagName.startsWith('-'))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    /** Initialise Custom Class */
    (htmlElementCtor as unknown as WithDescriptor).__descriptor = descriptor;
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