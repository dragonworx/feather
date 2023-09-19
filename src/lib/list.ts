import { Component } from './component';
import { html } from './util';

type ListView = HTMLDivElement;

export class List<IM, IV> extends Component<IM[], ListView> {
    constructor(model?: IM[], view?: ListView)
    {
        super(model, view);
    }

    protected defaults(): IM[]
    {
        return [];
    }

    protected createView(): ListView
    {
        return html(`<div></div>`);
    }

    protected initFromModel(): void
    {
        // iterate model
        // - create html string of all children views
        // - then create components for each child
        // - passing the view and model
        // from here on in we use addItem and insertItem
    }

    protected createItem(item: IM): IV
    {
        return null;
    }

    public addItem(item: IM): void {
        this.insertItem(item, this.model.length);
    }

    public insertItem(item: IM, index: number): void {
        this.model.splice(index, 0, item);
        // this.view.insertBefore(this.createItem(item), this.view.children[index]);
    }

}