import { ButtonBehavior } from '$lib/behaviors/button';
import { Control, type ControlDescriptor } from '../control';

export interface CheckboxModel {
	label: string;
	isChecked: boolean;
}

export class Checkbox extends Control<HTMLInputElement, CheckboxModel> {
	static descriptor: ControlDescriptor<CheckboxModel> = {
		id: 'checkbox',
		props: {
			label: '',
			isChecked: false,
		},
		html: `<input type="checkbox" />`,
	}

	protected init(): void {
		this.addBehavior(new ButtonBehavior());
	}

	protected render(): void {
		this.element.checked = this._props.isChecked;
	}
}
