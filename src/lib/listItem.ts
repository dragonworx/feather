import { Component } from './component';

export abstract class ListItem<M = unknown> extends Component<M, HTMLLIElement> {
    public template(): string {
		return `<li></li>`;
	}
}

export class StringListItem extends ListItem<string> {
    protected defaults(): string {
        return '';
    }

    protected updateView(): void {
        this.view.textContent = this.model;
    }
}