import { BaseControl, Ctrl } from './builder';
import { css } from './util';

export enum ButtonFlag
{
    Left = 1,
    Middle = 4,
    Right = 2
}

export interface ButtonProps
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
    props: {
        buttons: ButtonFlag.Left,
        isDown: false,
        isToggle: false,
        isToggled: false,
        longPressTime: 500,
    },
    classes: ['button'],
}, class extends BaseControl<ButtonProps, ButtonEvent>
{
    private _longPressTimeout = 0;

    protected mount(): void
    {
        console.log("button mount");

        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseleave', this.onMouseLeave);

        if (this.props.isToggle && this.props.isToggled)
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
        if (!checkFlag(e.buttons, this.props.buttons))
        {
            return;
        }

        clearTimeout(this._longPressTimeout);

        this.props.isDown = true;

        this._longPressTimeout = setTimeout(() =>
        {
            this.emit('longPress');
        }, this.props.longPressTime) as unknown as number;

        window.addEventListener('mouseup', this.onMouseUp);
    };

    protected onMouseUp = (e: MouseEvent) =>
    {
        this.props.isDown = false;

        clearTimeout(this._longPressTimeout);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.classList.remove(_css.down);

        if (e.target === this || this.contains(e.target as Node))
        {
            this.emit('up');

            this.props.isToggled = !this.props.isToggled;
        } else
        {
            this.emit('upOutside');
        }
    };

    protected onMouseLeave = () =>
    {
        clearTimeout(this._longPressTimeout);
    };

    protected onPropChanged<K extends keyof ButtonProps>(name: K, oldValue: ButtonProps[K], newValue: ButtonProps[K]): void
    {
        const { props } = this;

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
                if (typeof newValue === 'boolean' && props.isToggle && props.isToggled !== newValue)
                {
                    props.isToggled = newValue;

                    if (props.isToggled)
                    {
                        this.classList.add(_css.toggled);
                    } else
                    {
                        this.classList.remove(_css.toggled);
                    }

                    this.emit('toggle', { isToggled: props.isToggled });
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