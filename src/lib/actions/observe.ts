import type { ActionReturn } from 'svelte/action';

type Attributes = {
    'on:observe-change'?: (e: CustomEvent<DOMRectReadOnly>) => void;
}

export default function observe(node: HTMLElement): ActionReturn<undefined, Attributes>
{

    const resizeObserver = new ResizeObserver(entries =>
    {
        const entry = entries.at(0);

        if (entry)
        {
            const rect = entry.contentRect;
            node.dispatchEvent(new CustomEvent('observe-change', { detail: rect }));

        }
    });

    resizeObserver.observe(node);

    return {
        destroy: () =>
        {
            resizeObserver.unobserve(node);
        }
    };
}