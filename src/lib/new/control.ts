// import { Behavior } from './behavior';
import { getDescriptors, type ControlCtorWithDescriptor, html } from './util';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ControlDescriptor<P extends object = object>
{
    id: string;
    props: P;
    template: string;
}

export type EventHandler<P> = (event: P) => void;

export const attributePrefix = 'ctl';
export const metaPrefix = `${attributePrefix}-control`;

export type HTMLElementWithMetaData = HTMLElement & { [metaPrefix]: Control };

export abstract class Control<P extends object = object, E extends HTMLElement = HTMLElement> {
    protected _props: P;
    protected _element?: E;

    protected _map: Map<string, any> = new Map();
    protected _listeners: Map<string, EventHandler<any>[]> = new Map();

    public static descriptor: ControlDescriptor<object> = {
        id: 'control',
        props: {},
        template: '',
    };

    public static elementOwner(source: Event | HTMLElement): Control | null
    {
        const element = source instanceof Event ? source.target : source;
        if (
            element &&
            metaPrefix in element &&
            element[metaPrefix] instanceof Control
        )
        {
            return element[metaPrefix];
        }
        return null;
    }

    constructor(props?: Partial<P>)
    {
        if ('isBehavior' in this)
        {
            this._props = {} as P;
            return
        }

        const descriptors = getDescriptors(this.constructor as any);

        const descriptor = descriptors[descriptors.length - 1] as any;

        this._props = {
            ...descriptor.props,
            ...props,
        };

        if (descriptor.template.trim().length === 0)
        {
            throw new Error('html template cannot be empty');
        }

        const element = this._element = html(descriptor.template);
        element.classList.add(...descriptors.map(descriptor => `${attributePrefix}-${descriptor.id}`));
        (element as unknown as HTMLElementWithMetaData)[metaPrefix] = this as unknown as Control;
    }

    public descriptors(): ControlDescriptor<object>[]
    {
        return getDescriptors(this.constructor as any);
    }

    public get descriptor()
    {
        return (this.constructor as unknown as ControlCtorWithDescriptor<P>).descriptor;
    }

    public get props(): P
    {
        return {
            ...this._props
        };
    }

    public get element(): E
    {
        return this._element as E;
    }

    public on<K extends string>(key: K, listener: EventHandler<any>)
    {
        if (!this._listeners.has(key))
        {
            this._listeners.set(key, []);
        }

        this._listeners.get(key)!.push(listener);

        return this;
    }

    public emit<T>(key: string, event: T)
    {
        if (!this._listeners.has(key))
        {
            return;
        }

        for (const listener of this._listeners.get(key)!)
        {
            listener(event);
        }
    }

    public mount()
    {
    }

    public unmount()
    {
    }
}