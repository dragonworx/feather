// import { ControlBase } from './controlBase';
import type { AttributeDescriptor } from './builder';
import type { ControlProps } from './controlBase';
import { ControlWithProps } from './controlWithProps';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomEventListener<T = any>
{
    (evt: CustomEvent<T>): void;
}

export type ControlEventHandler = EventListener | CustomEventListener;

export type ControlEventMap = {
    [k: string]: object | null | undefined;
};

/** Control With Events extends Control With Props */
export abstract class ControlWithEvents<
    PropsType extends ControlProps = ControlProps,
    AttribType extends AttributeDescriptor = AttributeDescriptor,
    EventType extends ControlEventMap = ControlEventMap
> extends ControlWithProps<PropsType, AttribType>
{
    private _listeners: Map<string, CustomEventListener[]> = new Map(); // track custom event listeners internally

    private listenersForType(type: string)
    {
        if (!this._listeners.has(type))
        {
            this._listeners.set(type, []);
        }
        return this._listeners.get(type)!;
    }

    public on = (<T extends EventType>() =>
        <E extends keyof T>(
            type: E,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);
            this.listenersForType(key).push(listener);
            this.addEventListener(key, listener as EventListenerOrEventListenerObject, options);

            return this;
        })();

    public off = (<T extends EventType>() =>
        <E extends keyof T>(
            type: E,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);

            if (!this._listeners.has(key))
            {
                return this;
            }

            const listeners = this.listenersForType(key);

            if (listener)
            {
                // remove listener
                const index = listeners.indexOf(listener);
                if (index !== -1)
                {
                    listeners.splice(index, 1);
                }

                if (listeners.length === 0)
                {
                    this._listeners.delete(key);
                }

                this.removeEventListener(
                    key,
                    listener as EventListenerOrEventListenerObject,
                    options
                );
            } else
            {
                // remove all
                for (const l of listeners)
                {
                    this.removeEventListener(key, l as EventListenerOrEventListenerObject, options);
                }

                this._listeners.delete(key);
            }

            return this;
        })();

    public emit = (<T extends EventType>() =>
        <E extends keyof T>(
            type: E,
            detail?: T[E] extends object ? T[E] : (T[E] extends null ? null : object)
        ): this =>
        {
            const key = String(type);

            this.dispatchEvent(
                new CustomEvent(key, {
                    detail,
                    bubbles: true,
                    cancelable: true
                })
            );

            return this;
        })();
}