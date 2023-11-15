/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionReturn } from 'svelte/action';

type Props = {
    type?: string
}

export default function control(node: HTMLElement, props: Partial<Props> = {}): ActionReturn<Props>
{
    node.classList.add('control');
    props.type && node.classList.add(props.type);
    node.setAttribute('tabindex', '0');

    return {
        update: (updatedProp) => { },
        destroy: () =>
        {
            //
        }
    };
}