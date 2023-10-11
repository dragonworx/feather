import { Behavior } from '$lib/behavior';

export interface ButtonBehaviorOptions {}

export type ButtonBehaviorEvents = 'down' | 'up' | 'upOutside';

const css = {
	down: 'down'
};

export class ButtonBehavior extends Behavior<ButtonBehaviorOptions, ButtonBehaviorEvents> {
	private _isDown = false;

	protected defaultOptions(): ButtonBehaviorOptions {
		return {};
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

	protected onMouseDown = () => {
		this._isDown = true;
		window.addEventListener('mouseup', this.onMouseUp);
		this.component.addClass(css.down);
		this.emit('down');
	};

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
