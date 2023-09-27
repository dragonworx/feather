import { Component } from './component';

export abstract class List<IM, IV extends ListItem<unknown>> 
    extends Component<IM[], HTMLUListElement>
{
   static componentId = 'list';

    protected defaults(): IM[]
    {
        return [];
    }

    public template(): string
    {
        return `<ul></ul>`;
    }

    protected abstract createItem(itemModel: IM): IV;

    protected onModelReset(): void
    {
        this.view.innerHTML = '';

        for (const item of this.model) {
            const listItem = this.createItem(item);
            this.view.appendChild(listItem.view);
        }
    }

    public insertItem(item: IM, index: number): void {
        this.model.splice(index, 0, item);
        const listItem = this.createItem(item);
        this.view.insertBefore(listItem.view, this.view.children[index]);
    }

    public addItem(item: IM): void {
        this.insertItem(item, this.model.length);
    }
}

export abstract class ListItem<T> extends Component<T, HTMLLIElement> {
    static componentId = 'list-item';

    public template(): string {
        return `<li></li>`;
    }

    public toString(): string {
        return String(this.model);
    }

    protected updateView(): void {
        this.view.textContent = this.toString();
    }
}

export class StringListItem extends ListItem<string> {
    static componentId = 'string-list-item';

    protected defaults(): string {
        return '';
    }

    protected init(): void
    {
        this.on('mousedown', () => {
            if (this.hasStyle('color', 'red')) {
                this.clearStyle('color');
            } else {
                this.style({
                    color: 'red',
                });
            }
        });
    }
}

export class StringList extends List<string, StringListItem> {
    static componentId = 'string-list';

    protected createItem(itemModel: string): StringListItem {
        return new StringListItem(itemModel);
    }
}