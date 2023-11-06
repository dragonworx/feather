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
    isModified?: boolean;
    isAdded?: boolean;
    isRemoved?: boolean;
    value?: unknown;
    oldValue?: unknown;
}

type DiffObject = object;

export type DiffSet<P extends object = object> = Record<keyof P, Diff>;

export function simpleDiff<P extends object = object>(source: DiffObject, target: DiffObject): DiffSet<P>
{
    const diffs: DiffSet<P> = {} as DiffSet<P>;

    // Check for added or modified properties in the target object
    for (const [key, value] of Object.entries(target))
    {
        if (!(key in source))
        {
            diffs[key as keyof P] = {
                value,
                type: DiffType.Added,
                isAdded: true,
            };
        }
        else if ((source as any)[key] !== value)
        {
            diffs[key as keyof P] = {
                value,
                oldValue: (source as any)[key],
                type: DiffType.Modified,
                isModified: true,
            };
        }
    }

    // Check for properties that were removed from the target object
    for (const key of Object.keys(source))
    {
        if (!(key in target))
        {
            diffs[key as keyof P] = {
                oldValue: (source as any)[key],
                type: DiffType.Removed,
                isRemoved: true,
            };
        }
    }

    return diffs;
}