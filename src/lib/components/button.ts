import { ButtonBehavior } from '$lib/behaviors/button';
import { RightClickBehavior } from '$lib/behaviors/rightClick';
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

	protected init() {
		this.addBehavior('button', new ButtonBehavior());
		this.addBehavior('rightClick', new RightClickBehavior());
	}
}
