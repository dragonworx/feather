import { Component } from '../../component';

export interface FlowLayoutModel {
    direction: 'horizontal' | 'vertical';
    gap: number;
    isReversed: boolean;
    justify: 'start' | 'end' | 'center' |'stretch';
    align: 'start' | 'end' | 'center' |'center' | 'baseline';
}

export class FlowLayout extends Component<HTMLDivElement, FlowLayoutModel> {
    public static componentId = 'flow-layout';

    public defaultModel(): FlowLayoutModel
    {
        return {
            direction: 'vertical',
            gap: 5,
            isReversed: false,
            justify: 'start',
            align: 'start',
        };
    }

    public template(): string
    {
        return `<div></div>`;
    }

    protected render(): void
    {
        const { model } = this;
        this.setClassIf('horizontal', model.direction === 'horizontal');
        this.setClassIf('vertical', model.direction === 'vertical');
        this.setClassIf('reverse', model.isReversed);
        // this.style({
        //     'gap': `${model.gap}px`,
        //     'justifyItems': model.justify,
        //     'alignItems': model.align,
        // });
    }
}