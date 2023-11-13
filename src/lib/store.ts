import { writable, type Writable, get } from 'svelte/store';

export function createNestedStores<T extends Record<string, unknown>>(obj: T, basePath: string = ''): T
{
    const stores = new Map<string, Writable<unknown>>();

    const createStoreIfNeeded = (fullPath: string, value: unknown): Writable<unknown> =>
    {
        if (!stores.has(fullPath))
        {
            stores.set(fullPath, writable(value));
        }
        return stores.get(fullPath)!;
    };

    const createProxy = <T extends Record<string, unknown>>(target: T, path: string): T =>
    {
        return new Proxy(target, {
            get: (_, prop: string): unknown =>
            {
                const fullPath = path ? `${path}.${prop}` : prop;
                const value = target[prop];
                if (typeof value === 'object' && value !== null && !Array.isArray(value))
                {
                    return createProxy(value as Record<string, unknown>, fullPath);
                } else
                {
                    return get(createStoreIfNeeded(fullPath, value));
                }
            },
            set: (_, prop: string, value): boolean =>
            {
                const fullPath = path ? `${path}.${prop}` : prop;
                const store = createStoreIfNeeded(fullPath, value);
                store.set(value);
                return true;
            }
        });
    };

    return createProxy(obj, basePath);
}
