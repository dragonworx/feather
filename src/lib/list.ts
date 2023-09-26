import { Component, type Constructor } from './component';
import type { ListItem } from './listItem';

type ListView = HTMLDivElement;

export class List<IM, IV extends ListItem<IM>> 
    extends Component<IM[], ListView>
{

    constructor(protected readonly itemCtor: Constructor<IV>, model?: IM[])
    {
        super(model);
    }

    protected defaults(): IM[]
    {
        return [];
    }

    protected createItem(item: IM): IV
    {
        const listItem = new this.itemCtor(item);
        listItem.value = item;
        return listItem;
    }

    protected initFromModel(): void
    {
        this.model.forEach((item) => {
            const listItem = this.createItem(item);
            this.view.appendChild(listItem.view);
        });
    }

    public addItem(item: IM): void {
        this.insertItem(item, this.model.length);
    }

    public insertItem(item: IM, index: number): void {
        this.model.splice(index, 0, item);
        const listItem = this.createItem(item);
        this.view.insertBefore(listItem.view, this.view.children[index]);
    }
}