import { Component } from '../component';

export interface DebugComponentModel {
    label: string;
    color: string;
    width: number;
    height: number;
}

export class Debug extends Component<HTMLDivElement, DebugComponentModel> {
    public static componentId = 'debug';

    public defaultModel(): DebugComponentModel
    {
        return {
            label: '',
            color: 'red',
            width: 100,
            height: 100
        }
    }

    public template(): string {
        return `<div><span/></div>`;
    }

    public render(): void {
        const {label: text,color,width,height} = this.model;
        this.querySelector<HTMLSpanElement>('span').textContent = text;
        this.style({
            backgroundColor: color,
            width: `${width}px`,
            height: `${height}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            outline: '1px dotted white'
        });
    }
}