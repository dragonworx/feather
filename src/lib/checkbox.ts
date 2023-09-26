import { Component } from './component';

export class Checkbox extends Component<boolean, HTMLInputElement> {
	static componentId = 'checkbox';

	protected defaults(): boolean {
		return false;
	}

	public template(): string {
		return `<input type="checkbox" />`;
	}

	protected updateView(): void {
		this.view.checked = this.model;
	}
}
