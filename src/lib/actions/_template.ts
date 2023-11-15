/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionReturn } from 'svelte/action';
import { checkFlag, insertClass, setClass } from '../util';

// type Event = {
//     down: undefined;
// };

type Attributes = {
    // 'on:button-down'?: (e: CustomEvent<Event['down']>) => void;
}

type Props = object;

export default function action(node: HTMLElement, props?: Partial<Props>): ActionReturn<Props, Attributes>
{


    return {
        update: (updatedProp) => { },
        destroy: () =>
        {
            //
        }
    };
}