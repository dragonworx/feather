import { Component } from '../component';

export abstract class List<IM, IV extends ListItem<unknown>> extends Component<
	HTMLUListElement,
	IM[]
> {
	static componentId = 'list';

	protected defaultModel(): IM[] {
		return [];
	}

	public template(): string {
		return `<ul></ul>`;
	}

	protected abstract createItem(itemModel: IM): IV;

	protected onModelChanged(): void {
		this.element.innerHTML = '';

		for (const item of this.model) {
			const listItem = this.createItem(item);
			this.element.appendChild(listItem.element);
		}
	}

	public insertItem(item: IM, index: number): void {
		this.model.splice(index, 0, item);
		const listItem = this.createItem(item);
		this.element.insertBefore(listItem.element, this.element.children[index]);
	}

	public addItem(item: IM): void {
		this.insertItem(item, this.model.length);
	}
}

export abstract class ListItem<T extends object> extends Component<HTMLLIElement, T> {
	static componentId = 'list-item';

	public template(): string {
		return `<li></li>`;
	}

	public toString(): string {
		return String(this.model);
	}

	protected render(): void {
		this.element.textContent = this.toString();
	}
}

export class StringListItem extends ListItem<string> {
	static componentId = 'string-list-item';

	protected defaultModel(): string {
		return '';
	}

	protected init(): void {
		this.on('mouseenter', () => this.emit('hover', this.model));
	}
}

export class StringList extends List<string, StringListItem> {
	static componentId = 'string-list';

	protected createItem(itemModel: string): StringListItem {
		return new StringListItem(itemModel);
	}
}
