import { Ctrl } from './builder';
import { Control } from './control';

export enum ButtonFlag
{
    Left = 1,
    Middle = 4,
    Right = 2
}

export interface ButtonProps
{
    buttons: ButtonFlag;
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
    down: 'down'
};

function checkFlag(flag: number, mode: ButtonFlag): boolean
{
    return (flag & mode) !== 0;
}

export default Ctrl({
    tagName: 'button',
    props: {
        buttons: ButtonFlag.Left,
        isToggle: false,
        isToggled: false,
        longPressTime: 500,
    },
    classes: ['button'],
}, class Button extends Control<ButtonProps, ButtonEvent>
{
    private _isDown = false;
    private _isToggled = false;
    private _longPressTimeout = 0;

    public get isDown()
    {
        return this._isDown;
    }

    protected mount(): void
    {
        console.log("button mount");

        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseleave', this.onMouseLeave);

        this._isToggled = this.props.isToggled;

        if (this.props.isToggle && this._isToggled)
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

        this._isDown = true;
        clearTimeout(this._longPressTimeout);

        this._longPressTimeout = setTimeout(() =>
        {
            this.emit('longPress');
        }, this.props.longPressTime) as unknown as number;

        window.addEventListener('mouseup', this.onMouseUp);

        this.classList.add(_css.down);
        this.emit('down');
    }

    protected onMouseLeave = () =>
    {
        clearTimeout(this._longPressTimeout);
    }

    protected onMouseUp = (e: MouseEvent) =>
    {
        this._isDown = false;

        clearTimeout(this._longPressTimeout);
        window.removeEventListener('mouseup', this.onMouseUp);
        this.classList.remove(_css.down);

        if (e.target === this || this.contains(e.target as Node))
        {
            this.emit('up');

            this.isToggled = !this.isToggled;
        } else
        {
            this.emit('upOutside');
        }
    };

    public get isToggle(): boolean
    {
        return this.props.isToggle;
    }

    public set isToggle(value: boolean)
    {
        this.props.isToggle = value;
    }

    public get isToggled(): boolean
    {
        return this._isToggled;
    }

    public set isToggled(value: boolean)
    {
        if (this.props.isToggle && this._isToggled !== value)
        {
            this._isToggled = value;
            if (this._isToggled)
            {
                this.classList.add('toggled');
            } else
            {
                this.classList.remove('toggled');
            }
            this.emit('toggle', { isToggled: this._isToggled });
        }
    }
});