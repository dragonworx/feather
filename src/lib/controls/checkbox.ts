import { ButtonBehavior } from '$lib/behaviors/button';
import { Control, type ControlDescriptor } from '../control_orig';

export interface CheckboxProps
{
	label: string;
	isChecked: boolean;
}

export class Checkbox extends Control<HTMLInputElement, CheckboxProps> {
	static descriptor: ControlDescriptor<CheckboxProps> = {
		id: 'checkbox',
		props: {
			label: '',
			isChecked: false,
		},
		template: `<div><svg width="20px" height="20px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z"/></svg></div>`,
	}

	protected init(): void
	{
		this.addBehavior(new ButtonBehavior({
			isToggle: true,
		}));
	}

	protected render(): void
	{
		this.element.checked = this._props.isChecked;
	}
}
