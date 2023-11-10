import { BaseControl } from './control';
import { drag } from './draggable';
import { checkFlag } from './util';

export enum ButtonFlag
{
    Left = 1,
    Middle = 4,
    Right = 2
}

export type InteractiveControlState =
{
    buttons: ButtonFlag;
    isDown: boolean;
    isToggle: boolean;
    isToggled: boolean;
    longPressTime: number;
}

export const defaultState: InteractiveControlState = {
    buttons: ButtonFlag.Left,
    isDown: false,
    isToggle: false,
    isToggled: false,
    longPressTime: 500,
};

export type InteractiveControlEvent = {
    down: null;
    up: null;
    upOutside: null;
    toggle: { isToggled: boolean };
    longPress: null;
}

const cssClasses = {
    down: 'down',
    toggled: 'toggled',
};

export abstract class InteractiveControl<
    S extends InteractiveControlState,
    E extends InteractiveControlEvent = InteractiveControlEvent
> 
extends BaseControl<
    S & InteractiveControlState,
    E & InteractiveControlEvent
>
{
    private _longPressTimeout = 0;

    protected mount(): void
    {
        const { state } = this;

        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseleave', this.onMouseLeave);
        this.addEventListener('keydown', this.onKeyDown);
        this.addEventListener('keyup', this.onKeyUp);

        if (state.isToggle && state.isToggled)
        {
            this.classList.add('toggled');
        }
    }

    protected unmount(): void
    {
        this.removeEventListener('mousedown', this.onMouseDown);
        this.removeEventListener('mouseleave', this.onMouseLeave);
    }

    protected onMouseDown = (e: MouseEvent, force = false) =>
    {
        const { state } = this;

        if (!force && !checkFlag(e.buttons, state.buttons))
        {
            return;
        }

        clearTimeout(this._longPressTimeout);

        state.isDown = true;

        this._longPressTimeout = setTimeout(() => this.emit('longPress'), state.longPressTime) as unknown as number;

        if (!force) {
            window.addEventListener('mouseup', this.onMouseUp);

            drag({
                onStart: (e) => console.log("drag start", e.xDelta, e.yDelta),
                onMove: (e) => console.log("drag move", e.xDelta, e.yDelta),
                onEnd: (e) => console.log("drag end", e.xDelta, e.yDelta),
            });
        }
    };

    protected onMouseUp = (e: MouseEvent) =>
    {
        const { state } = this;

        state.isDown = false;

        clearTimeout(this._longPressTimeout);
        this.classList.remove(cssClasses.down);
        
        window.removeEventListener('mouseup', this.onMouseUp);

        if (e.target === this || this.contains(e.target as Node))
        {
            this.emit('up');

            state.isToggled = !state.isToggled;
        } else
        {
            this.emit('upOutside');
        }
    };

    protected onMouseLeave = () =>
    {
        clearTimeout(this._longPressTimeout);
    };

    protected onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ')
        {
            this.onMouseDown(e as unknown as MouseEvent, true);
        }
    }

    protected onKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ')
        {
            this.onMouseUp(e as unknown as MouseEvent);
        }
    }

    protected onStateChanged<K extends keyof InteractiveControlState>(name: K, oldValue: InteractiveControlState[K], newValue: InteractiveControlState[K]): void
    {
        const { state } = this;

        switch (name)
        {
            case 'isDown':
                if (newValue === true && oldValue === false)
                {
                    this.classList.add(cssClasses.down);
                    this.emit('down');
                }
                break;
            case 'isToggled':
                if (typeof newValue === 'boolean' && state.isToggle && oldValue !== newValue)
                {
                    state.isToggled = newValue;

                    this.setClass(cssClasses.toggled, newValue);
                    this.emit('toggle', { isToggled: state.isToggled });
                }
                break;
        }
    }
}