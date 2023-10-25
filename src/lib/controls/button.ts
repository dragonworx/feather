import { ButtonBehavior, type ButtonBehaviorEvent } from '$lib/behaviors/button';
import { ContextMenuBehavior } from '$lib/behaviors/contextMenu';
import { Control, type ControlDescriptor, type ControlEvent } from '../control';

export interface ButtonProps {
	label: string;
	// todo: if pass menu, make use of contextMenuBehavior optional
}

export type ButtonEvent = ControlEvent | ButtonBehaviorEvent;

export class Button extends Control<HTMLButtonElement, ButtonProps, ButtonEvent> {
	
	static descriptor: ControlDescriptor<ButtonProps> = {
		id: 'button',
		props: {
			label: '',
		},
		template: `<button type="button"></button>`,
	}

	protected render(): void {
		this.element.textContent = this._props.label
	}

	protected init() {
		this.addBehavior(new ButtonBehavior());
		this.addBehavior(new ContextMenuBehavior());
	}
}
