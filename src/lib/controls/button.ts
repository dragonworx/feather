import { ButtonBehavior } from '$lib/behaviors/button';
import { ContextMenuBehavior } from '$lib/behaviors/contextMenu';
import { Control, type ControlDescriptor } from '../control';

export interface ButtonModel {
	label: string;
	// todo: if pass menu, make use of contextMenuBehavior optional
}

export class Button extends Control<HTMLButtonElement, ButtonModel> {
	
	static descriptor: ControlDescriptor<ButtonModel> = {
		id: 'button',
		props: {
			label: '',
		},
		html: `<button type="button"></button>`,
	}

	protected render(): void {
		this.element.textContent = this._props.label
	}

	protected init() {
		this.addBehavior(new ButtonBehavior());
		this.addBehavior(new ContextMenuBehavior());
	}
}
