import { Component } from '../component';

export class Button extends Component<HTMLButtonElement, string> {
	static componentId = 'button';

	protected defaults(): string {
		return '';
	}

	public template(): string {
		return `<button type="button"></button>`;
	}

	protected updateElement(): void {
		this.element.textContent = this.model;
	}
}
