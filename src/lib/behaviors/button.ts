import { Behavior } from '$lib/behavior';

export enum ButtonFlag {
	Left = 1,
	Middle = 4,
	Right = 2
}

export interface ButtonBehaviorOptions {
	buttons: ButtonFlag;
	isToggle: boolean;
	isToggled: boolean;
	longPressTime: number;
}

export type ButtonBehaviorEvent = 'down' | 'up' | 'upOutside' | 'toggle' | 'longPress';

const _css = {
	down: 'down'
};

function checkFlag(flag: number, mode: ButtonFlag): boolean {
	return (flag & mode) !== 0;
}

export class ButtonBehavior extends Behavior<ButtonBehaviorOptions, ButtonBehaviorEvent> {
	private _isDown = false;
	private _isToggled = false;
	private _longPressTimeout = 0;

	public static id = 'button';

	protected defaultOptions(): ButtonBehaviorOptions {
		return {
			buttons: ButtonFlag.Left,
			isToggle: false,
			isToggled: false,
			longPressTime: 500,
		};
	}

	public get isDown() {
		return this._isDown;
	}

	public install(): void {
		const { component } = this;

		component.on('mousedown', this.onMouseDown);
		component.on('mouseleave', this.onMouseLeave);

		this._isToggled = this.options.isToggled;

		if (this.options.isToggle && this._isToggled) {
			this.component.addClass('toggled');
		}
	}

	public uninstall(): void {
		const { component } = this;
		component.off('mousedown', this.onMouseDown);
		component.off('mouseleave', this.onMouseLeave);
	}

	protected onMouseDown = ((e: MouseEvent) => {
		if (!checkFlag(e.buttons, this.options.buttons)) {
			return;
		}

		this._isDown = true;
		clearTimeout(this._longPressTimeout);

		this._longPressTimeout = setTimeout(() => {
			this.emit('longPress');
		}, this.options.longPressTime) as unknown as number;

		window.addEventListener('mouseup', this.onMouseUp);

		this.component.addClass(_css.down);
		this.emit('down');
	}) as EventListener;

	protected onMouseLeave = (() => {
		clearTimeout(this._longPressTimeout);
	}) as EventListener;

	protected onMouseUp = (e: MouseEvent) => {
		this._isDown = false;

		clearTimeout(this._longPressTimeout);
		window.removeEventListener('mouseup', this.onMouseUp);
		this.component.removeClass(_css.down);

		if (e.target === this.element || this.element.contains(e.target as Node)) {
			this.emit('up');

			this.isToggled = !this.isToggled;
		} else {
			this.emit('upOutside');
		}
	};

	public get isToggle(): boolean {
		return this.options.isToggle;
	}

	public set isToggle(value: boolean) {
		this.options.isToggle = value;
	}

	public get isToggled(): boolean {
		return this._isToggled;
	}

	public set isToggled(value: boolean) {
		if (this.options.isToggle && this._isToggled !== value) {
			this._isToggled = value;
			if (this._isToggled) {
				this.component.addClass('toggled');
			} else {
				this.component.removeClass('toggled');
			}
			this.emit('toggle', this._isToggled);
		}
	}
}
