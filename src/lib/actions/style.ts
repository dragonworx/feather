import type { ActionReturn } from 'svelte/action';
import { installStyle, uninstallStyle } from '../stylesheet';

type Props = string;

export default function style(node: HTMLElement, props?: Props): ActionReturn<Props>
{
    if (props)
    {
        installStyle(props, node);
    }

    return {
        update: (updatedProp) =>
        {
            if (props !== updatedProp && updatedProp)
            {
                installStyle(updatedProp, node);
                props = updatedProp;
            }
        },
        destroy: () =>
        {
            uninstallStyle(node);
        }
    };
}