import { Control, type ControlDescriptor } from '../control';

export interface DebugComponentModel {
    label: string;
    color: string;
    width: number;
    height: number;
}

export class Debug extends Control<HTMLDivElement, DebugComponentModel> {

    public static descriptor: ControlDescriptor<DebugComponentModel> = {
        id: 'debug',
        props: {
            label: '',
            color: 'red',
            width: 100,
            height: 100
        },
        html: `<div><span/></div>`
    }

    public render(): void {
        const {label: text,color,width,height} = this._props;
        this.querySelector<HTMLSpanElement>('span').textContent = text;
        this.setStyle({
            background: color,
            width: `${width}px`,
            height: `${height}px`,
        });
    }
}