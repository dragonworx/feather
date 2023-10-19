import { ButtonBehavior } from '$lib/behaviors/button';
import { Component } from '../component';

export interface CheckboxModel {
	label: string;
	isChecked: boolean;
}

export class Checkbox extends Component<HTMLInputElement, CheckboxModel> {
	static componentId = 'checkbox';

	protected init(): void {
		this.addBehavior(new ButtonBehavior());
	}

	protected defaultModel(): CheckboxModel {
		return {
			label: '',
			isChecked: false,
		};
	}

	public template(): string {
		return `<input type="checkbox" />`;
	}

	protected render(): void {
		this.element.checked = this.model.isChecked;
	}
}
