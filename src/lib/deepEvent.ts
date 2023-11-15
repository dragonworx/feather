import { writable, type Writable } from 'svelte/store';

export type EventEndpoint = {
    subscribe: Writable<unknown>['subscribe'];
    emit: (eventData: unknown) => void;
};

export interface EventObject
{
    [key: string]: EventEndpoint | EventObject;
}

export function deepEvent<T extends EventObject>(obj: T): T
{
    const createEventEndpoint = (): EventEndpoint =>
    {
        const { subscribe, set } = writable<unknown>(null);
        return {
            subscribe,
            emit: (eventData: unknown) => set(eventData),
        };
    };

    const createProxy = <T extends EventObject>(target: T): T =>
    {
        return new Proxy(target, {
            get: (_, prop: string): EventEndpoint | EventObject =>
            {
                const value = target[prop];
                if (typeof value === 'object' && value !== null)
                {
                    return createProxy(value as EventObject);
                }
                return value as EventEndpoint;
            }
        });
    };

    // Initialize the object with event endpoints
    const initializeEndpoints = (target: EventObject) =>
    {
        for (const key in target)
        {
            if (typeof target[key] === 'object' && target[key] !== null)
            {
                initializeEndpoints(target[key] as EventObject);
            } else
            {
                target[key] = createEventEndpoint();
            }
        }
    };

    initializeEndpoints(obj);
    return createProxy(obj);
}
