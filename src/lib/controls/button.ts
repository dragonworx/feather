import { ButtonBehavior, type ButtonBehaviorEvent } from '$lib/behaviors/button';
import { ContextMenuBehavior } from '$lib/behaviors/contextMenu';
import { Control, type ControlDescriptor, type ControlEvent } from '../control';

export interface ButtonProps {
	label: string;
	isRound: boolean;
	// todo: if pass menu, make use of contextMenuBehavior optional
}

export type ButtonEvent = ControlEvent | ButtonBehaviorEvent;

export class Button extends Control<HTMLButtonElement, ButtonProps, ButtonEvent> {
	
	static descriptor: ControlDescriptor<ButtonProps> = {
		id: 'button',
		props: {
			label: '',
			isRound: false,
		},
		template: `<button type="button"><label /></button>`,
	}

	public get buttonBehavior(): ButtonBehavior {
		return this.behavior<ButtonBehavior>(ButtonBehavior.id);
	}

	public get contextMenuBehavior(): ContextMenuBehavior {
		return this.behavior<ContextMenuBehavior>(ContextMenuBehavior.id);
	}

	protected render(): void {
		this.querySelector('label').textContent = this._props.label
	}

	protected init() {
		this.addBehavior(new ButtonBehavior());
		this.addBehavior(new ContextMenuBehavior());
	}

	public get isToggle(): boolean {
		return this.buttonBehavior.isToggle;
	}

	public set isToggle(value: boolean) {
		this.buttonBehavior.isToggle = value;
	}

	public get isToggled(): boolean {
		return this.buttonBehavior.isToggled;
	}

	public set isToggled(value: boolean) {
		this.buttonBehavior.isToggled = value;
	}
}
