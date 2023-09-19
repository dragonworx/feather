import { Component } from './component';

export class Checkbox extends Component<boolean, HTMLInputElement> {
	protected defaults(): boolean {
		return false;
	}

	public static template(): string {
		return `<input type="checkbox" />`;
	}

	protected updateView(): void {
		this.view.checked = this.model;
	}
}
