/* eslint-disable @typescript-eslint/no-explicit-any */
export enum DiffType
{
    Added = 'added',
    Modified = 'modified',
    Removed = 'removed',
}

export interface Diff
{
    type: DiffType;
    key: string;
    value?: unknown;
    oldValue?: unknown;
}

type DiffObject = object;

export type DiffSet = Diff[];

export function simpleDiff(source: DiffObject, target: DiffObject): DiffSet
{
    const diffs: DiffSet = [];

    // Check for added or modified properties in the target object
    for (const [key, value] of Object.entries(target))
    {
        if (!(key in source))
        {
            diffs.push({
                key,
                value,
                type: DiffType.Added,
            });
        }
        else if ((source as any)[key] !== value)
        {
            diffs.push({
                key,
                value,
                oldValue: (source as any)[key],
                type: DiffType.Modified,
            });
        }
    }

    // Check for properties that were removed from the target object
    for (const key of Object.keys(source))
    {
        if (!(key in target))
        {
            diffs.push({
                key,
                oldValue: (source as any)[key],
                type: DiffType.Removed,
            });
        }
    }

    return diffs;
}

export class DiffMap
{
    constructor(public readonly map: Map<string, Diff>)
    {

    }

    public has(key: string)
    {
        return this.map.has(key);
    }

    public wasAdded(key: string)
    {
        const diff = this.map.get(key);

        if (diff)
        {
            return diff.type === DiffType.Added;
        }

        return false;
    }

    public wasRemoved(key: string)
    {
        const diff = this.map.get(key);

        if (diff)
        {
            return diff.type === DiffType.Removed;
        }

        return false;
    }

    public stillHas(key: string)
    {
        return !this.wasRemoved(key);
    }
}

export function simpleDiffMap(incoming: Record<string, unknown>, current: Record<string, unknown>)
{
    const diffs: Map<string, Diff> = new Map();

    // Check for added keys
    for (const key in incoming)
    {
        if (!(key in current))
        {
            diffs.set(key, {
                key,
                value: incoming[key],
                type: DiffType.Added,
            });
        }
    }

    // Check for removed keys
    for (const key in current)
    {
        if (!(key in incoming))
        {
            diffs.set(key, {
                key,
                oldValue: current[key],
                type: DiffType.Removed,
            });
        }
    }

    return new DiffMap(diffs);
}
