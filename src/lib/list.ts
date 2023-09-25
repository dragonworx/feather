import { Component, type Constructor } from './component';
import type { ListItem } from './listItem';

type ListView = HTMLDivElement;

export class List<IM, IV extends ListItem> 
    extends Component<IM[], ListView>
{
    protected itemCtor: Constructor<IV>;

    constructor(itemCtor: Constructor<IV>, model?: IM[])
    {
        super(model);
        this.itemCtor = itemCtor;
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

    public addItem(item: IM): void {
        this.insertItem(item, this.model.length);
    }

    public insertItem(item: IM, index: number): void {
        this.model.splice(index, 0, item);
        const listItem = this.createItem(item);
    }

}