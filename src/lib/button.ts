import { Component } from './component';

export class Button extends Component<HTMLButtonElement, string> {
	static componentId = 'button';

	protected defaults(): string {
		return '';
	}

	public template(): string {
		return `<button></button>`;
	}

	protected updateView(): void {
		this.view.textContent = this.model;
	}
}
