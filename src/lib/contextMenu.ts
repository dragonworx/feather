import type { BaseControl } from './control';

const _contextListeners: BaseControl[] = [];
const _hasInstalledContextHook = false;

export function installContextHook(control: BaseControl)
{
    _contextListeners.push(control);

    if (_hasInstalledContextHook)
    {
        return;
    }

    document.addEventListener('contextmenu', (e) =>
    {
        for (const listener of _contextListeners)
        {
            if (listener === e.target)
            {
                e.preventDefault();
                listener['onContext'](e);
            }
        }
    });

}

export function uninstallContextHook(control: BaseControl)
{
    const index = _contextListeners.indexOf(control);

    if (index !== -1)
    {
        _contextListeners.splice(index, 1);
    }
}