import { BaseControl, Ctrl } from './builder';
import { css } from './util';

export enum ButtonFlag
{
    Left = 1,
    Middle = 4,
    Right = 2
}

export interface ButtonState
{
    buttons: ButtonFlag;
    isDown: boolean;
    isToggle: boolean;
    isToggled: boolean;
    longPressTime: number;
}

export type ButtonEvent = {
    down: null;
    up: null;
    upOutside: null;
    toggle: { isToggled: boolean };
    longPress: null;
}

const _css = {
    down: 'down',
    toggled: 'toggled',
};

function checkFlag(flag: number, mode: ButtonFlag): boolean
{
    return (flag & mode) !== 0;
}

export default Ctrl({
    tagName: 'button',
    state: {
        buttons: ButtonFlag.Left,
        isDown: false,
        isToggle: false,
        isToggled: false,
        longPressTime: 500,
    },
    classes: ['button'],
}, class extends BaseControl<ButtonState, ButtonEvent>
{
    private _longPressTimeout = 0;

    protected mount(): void
    {
        const { state } = this;

        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseleave', this.onMouseLeave);

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

    protected onMouseDown = (e: MouseEvent) =>
    {
        const { state } = this;

        if (!checkFlag(e.buttons, state.buttons))
        {
            return;
        }

        clearTimeout(this._longPressTimeout);

        state.isDown = true;

        this._longPressTimeout = setTimeout(() => this.emit('longPress'), state.longPressTime) as unknown as number;

        window.addEventListener('mouseup', this.onMouseUp);
    };

    protected onMouseUp = (e: MouseEvent) =>
    {
        const { state } = this;

        state.isDown = false;

        clearTimeout(this._longPressTimeout);
        this.classList.remove(_css.down);
        
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

    protected onStateChanged<K extends keyof ButtonState>(name: K, oldValue: ButtonState[K], newValue: ButtonState[K]): void
    {
        const { state } = this;

        switch (name)
        {
            case 'isDown':
                if (newValue === true && oldValue === false)
                {
                    this.classList.add(_css.down);
                    this.emit('down');
                }
                break;
            case 'isToggled':
                if (typeof newValue === 'boolean' && state.isToggle && state.isToggled !== newValue)
                {
                    state.isToggled = newValue;

                    if (state.isToggled)
                    {
                        this.classList.add(_css.toggled);
                    } else
                    {
                        this.classList.remove(_css.toggled);
                    }

                    this.emit('toggle', { isToggled: state.isToggled });
                }
                break;
        }
    }


    protected css(): string | void
    {
        return css`
            background: red;

            &.${_css.down} {
                background: blue;
            }

            &.${_css.toggled} {
                background: blue;
            }
        `
    }
});