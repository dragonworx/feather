import { Component } from './component';
import { html } from './util';

export class Checkbox extends Component<HTMLInputElement, boolean> {
	protected defaultModel(): boolean {
		return false;
	}

	protected createView(): HTMLInputElement {
		return html(`<input type="checkbox" />`);
	}

	protected updateView(): void {
		this.view.checked = this.model;
	}
}
