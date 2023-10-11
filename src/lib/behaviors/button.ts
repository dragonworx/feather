import { Behavior } from '$lib/behavior';

export enum ButtonFlag {
	Left = 1,
	Middle = 4,
	Right = 2
}

export interface ButtonBehaviorOptions {
	buttons: ButtonFlag;
}

export type ButtonBehaviorEvents = 'down' | 'up' | 'upOutside';

const css = {
	down: 'down'
};

function checkFlag(flag: number, mode: ButtonFlag): boolean {
	return (flag & mode) !== 0;
}

export class ButtonBehavior extends Behavior<ButtonBehaviorOptions, ButtonBehaviorEvents> {
	private _isDown = false;

	protected defaultOptions(): ButtonBehaviorOptions {
		return {
			buttons: ButtonFlag.Left
		};
	}

	public get isDown() {
		return this._isDown;
	}

	public install(): void {
		const { component } = this;
		component.on('mousedown', this.onMouseDown);
	}

	public uninstall(): void {
		const { component } = this;
		component.off('mousedown', this.onMouseDown);
	}

	protected onMouseDown = ((e: MouseEvent) => {
		if (!checkFlag(e.buttons, this.options.buttons)) {
			return;
		}

		this._isDown = true;
		window.addEventListener('mouseup', this.onMouseUp);
		this.component.addClass(css.down);
		this.emit('down');
	}) as EventListenerOrEventListenerObject;

	protected onMouseUp = (e: MouseEvent) => {
		this._isDown = false;
		window.removeEventListener('mouseup', this.onMouseUp);
		this.component.removeClass(css.down);
		if (e.target === this.component.element) {
			this.emit('up');
		} else {
			this.emit('upOutside');
		}
	};
}
