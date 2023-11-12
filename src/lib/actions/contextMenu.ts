/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionReturn } from 'svelte/action';

type Attributes = {
    'on:context-menu'?: (e: CustomEvent<MouseEvent>) => void;
}

const _contextListeners: HTMLElement[] = [];
const _hasInstalledContextHook = false;

export function installContextHook(node: HTMLElement)
{
    _contextListeners.push(node);

    if (_hasInstalledContextHook)
    {
        return;
    }

    document.addEventListener('contextmenu', (e) =>
    {
        for (const listener of _contextListeners)
        {
            if (listener === e.target || listener.contains(e.target as Node))
            {
                e.preventDefault();
                node.dispatchEvent(new CustomEvent('context-menu', { detail: e }));
            }
        }
    });

}

export function uninstallContextHook(node: HTMLElement)
{
    const index = _contextListeners.indexOf(node);

    if (index !== -1)
    {
        _contextListeners.splice(index, 1);
    }
}

type Props = undefined;

export function contextMenu(node: HTMLElement, props?: Props): ActionReturn<Props, Attributes>
{
    installContextHook(node);

    return {
        update: (updatedProp) => { },
        destroy: () => { }
    };
}

