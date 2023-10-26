import { Behavior } from './behavior';
import { getDescriptors } from './util';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ControlDescriptor<P>
{
    id: string;
    props: P;
}

export type EventHandler<P> = (event: P) => void;

export class Control<P extends object = object> {
    public props: P;
    protected _map: Map<string, any> = new Map();

    protected listeners: Map<string, EventHandler<any>[]> = new Map();

    public static descriptor: ControlDescriptor<object> = {
        id: 'control',
        props: {},
    };

    constructor(props?: Partial<P>)
    {
        if (this instanceof Behavior)
        {
            this.props = {} as P;
            return
        }

        console.log('control constructor');

        const descriptors = getDescriptors(this.constructor as any);

        const descriptor = descriptors[descriptors.length - 1] as any;

        this.props = {
            ...descriptor.props,
            ...props,
        };
    }

    protected as<T>()
    {
        return this as unknown as T;
    }

    public controlMethod()
    {
        console.log('control method');
    }

    protected controlProtectedMethod()
    {
        return "foo23"
    }

    public get foo()
    {
        return 3
    }

    public set foo(value: number)
    {
        console.log('SET', value);
    }

    public get bar()
    {
        return 3
    }

    public set bar(value: number)
    {
        console.log('SET2', value);
    }

    protected getMap(key: string)
    {
        if (!this._map.has(key))
        {
            this._map.set(key, new Map());
        }

        return this._map.get(key);
    }

    protected setMap(key: string, value: any)
    {
        this._map.set(key, value);
    }

    public testWrite(key: string, value: any)
    {
        this.setMap(key, value);
    }

    public testRead(key: string)
    {
        return this.getMap(key);
    }

    protected addListener<K extends string>(key: K, listener: EventHandler<any>)
    {
        if (!this.listeners.has(key))
        {
            this.listeners.set(key, []);
        }

        this.listeners.get(key)!.push(listener);

        return this;
    }

    public emit<T>(key: string, event: T)
    {
        if (!this.listeners.has(key))
        {
            return;
        }

        for (const listener of this.listeners.get(key)!)
        {
            listener(event);
        }
    }
}