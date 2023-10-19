import { ButtonBehavior } from '$lib/behaviors/button';
import { ContextMenuBehavior } from '$lib/behaviors/contextMenu';
import { Component } from '../component';

export interface ButtonModel {
	label: string;
}

export class Button extends Component<HTMLButtonElement, ButtonModel> {
	static componentId = 'button';

	protected defaultModel(): ButtonModel {
		return {
			label: '',
		};
	}

	public template(): string {
		return `<button type="button"></button>`;
	}

	protected render(): void {
		this.element.textContent = this.model.label
	}

	protected init() {
		this.addBehavior(new ButtonBehavior());
		this.addBehavior(new ContextMenuBehavior());
	}
}
