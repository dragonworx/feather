import { ButtonBehavior } from '$lib/behaviors/button';
import { Component } from '../component';

export class Checkbox extends Component<HTMLInputElement, boolean> {
	static componentId = 'checkbox';

	protected init(): void {
		this.addBehavior(new ButtonBehavior());
	}

	protected defaultModel(): boolean {
		return false;
	}

	public template(): string {
		return `<input type="checkbox" />`;
	}

	protected updateElement(): void {
		this.element.checked = this.model;
	}
}
