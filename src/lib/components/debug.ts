import { InlineStyleBehavior } from '../behaviors/inlineStyle';
import { Component, type ComponentDescriptor } from '../component';

export interface DebugComponentModel {
    label: string;
    color: string;
    width: number;
    height: number;
}

export class Debug extends Component<HTMLDivElement, DebugComponentModel> {

    public static descriptor: ComponentDescriptor<DebugComponentModel> = {
        id: 'debug',
        model: {
            label: '',
            color: 'red',
            width: 100,
            height: 100
        },
        html: '<div><span/></div>'
    }

    protected init(): void
    {
        this.addBehavior(new InlineStyleBehavior(), 'style');
    }

    public render(): void {
        const {label: text,color,width,height} = this.model;
        this.querySelector<HTMLSpanElement>('span').textContent = text;
        this.behavior<InlineStyleBehavior>('style').setStyle({
            background: color,
            width: `${width}px`,
            height: `${height}px`,
        });
    }
}