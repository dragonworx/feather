import { ButtonBehavior } from '$lib/behaviors/button';
import { Component, type ComponentDescriptor, type ComponentTemplate } from '../component';

export interface CheckboxModel {
	label: string;
	isChecked: boolean;
}

export class Checkbox extends Component<HTMLInputElement, CheckboxModel> {
	static descriptor: ComponentDescriptor<CheckboxModel> = {
		id: 'button',
		model: {
			label: '',
			isChecked: false,
		},
		html: '<input type="checkbox" />',
	}

	public static componentId = 'checkbox';

	public template: ComponentTemplate<CheckboxModel> = {
		model: {
			label: '',
			isChecked: false,
		},
		html: '<input type="checkbox" />',
	}

	protected init(): void {
		this.addBehavior(new ButtonBehavior());
	}

	protected render(): void {
		this.element.checked = this.model.isChecked;
	}
}
