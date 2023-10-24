import { Control } from '../control';

export abstract class List<IM, IV extends ListItem<unknown>> extends Control<
	HTMLUListElement,
	IM[]
> {
	// static controlId = 'list';

	protected defaultModel(): IM[] {
		return [];
	}

	public template(): string {
		return `<ul></ul>`;
	}

	protected abstract createItem(itemModel: IM): IV;

	protected onPropsChanged(): void {
		this.element.innerHTML = '';

		for (const item of this._props) {
			const listItem = this.createItem(item);
			this.element.appendChild(listItem.element);
		}
	}

	public insertItem(item: IM, index: number): void {
		this._props.splice(index, 0, item);
		const listItem = this.createItem(item);
		this.element.insertBefore(listItem.element, this.element.children[index]);
	}

	public addItem(item: IM): void {
		this.insertItem(item, this._props.length);
	}
}

export abstract class ListItem<T extends object> extends Control<HTMLLIElement, T> {
	// static controlId = 'list-item';

	public template(): string {
		return `<li></li>`;
	}

	public toString(): string {
		return String(this._props);
	}

	protected render(): void {
		this.element.textContent = this.toString();
	}
}

export class StringListItem extends ListItem<string> {
	// static controlId = 'string-list-item';

	protected defaultModel(): string {
		return '';
	}

	protected init(): void {
		this.on('mouseenter', () => this.emit('hover', this._props));
	}
}

export class StringList extends List<string, StringListItem> {
	// static controlId = 'string-list';

	protected createItem(itemModel: string): StringListItem {
		return new StringListItem(itemModel);
	}
}
