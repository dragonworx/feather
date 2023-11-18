import type { ActionReturn } from 'svelte/action';

export interface Options
{
    xThreshold: number;
    yThreshold: number;
}

type DraggableEvent = object;

interface Attributes
{
    'on:drag-start'?: (e: CustomEvent<DraggableEvent>) => void;
    'on:drag-move'?: (e: CustomEvent<DraggableEvent>) => void;
    'on:drag-end'?: (e: CustomEvent<DraggableEvent>) => void;
}

export function drag(node: HTMLElement, props?: Props): ActionReturn<Props, Attributes>
{
}