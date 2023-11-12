/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionReturn } from 'svelte/action';

type Attributes = {
    'on:drag-start'?: (e: CustomEvent<DraggableEvent>) => void;
}

export function drag(node: HTMLElement, props?: DragOptions): ActionReturn<DragOptions, Attributes>
{
    node.style.position = 'relative';

    node.onmousedown = () => startDrag({
        ...props,
        startX: props?.startX ?? node.offsetLeft,
        startY: props?.startY ?? node.offsetTop,
        onStart(e)
        {
            props?.onStart?.(e);
            node.dispatchEvent(new CustomEvent('drag-start', { detail: e }));
        },
        onMove(e)
        {
            props?.onMove?.(e);
            node.style.left = e.xDelta + 'px';
            node.style.top = e.yDelta + 'px';
        },
    });

    return {
        update: (updatedProp) => { },
        destroy: () => { }
    };
}

export interface DraggableEvent
{
    sourceEvent: MouseEvent;
    xDelta: number;
    yDelta: number;
}

export type DragOptions = Partial<
    {
        startX: number;
        startY: number;
        xDistThreshold: number;
        yDistThreshold: number;
        onStart: (e: DraggableEvent) => void;
        onMove: (e: DraggableEvent) => void;
        onEnd: (e: DraggableEvent) => void;
    }>

const defaultOptions: Required<DragOptions> = {
    startX: 0,
    startY: 0,
    xDistThreshold: 10,
    yDistThreshold: 10,
    onStart: () => { },
    onMove: () => { },
    onEnd: () => { },
};

export function startDrag(options: DragOptions)
{
    const opts: Required<DragOptions> = {
        ...defaultOptions,
        ...options,
    };

    const { startX, startY, xDistThreshold, yDistThreshold, onStart, onMove, onEnd } = opts;

    let hasInit = false;
    let hasStarted = false;
    let xStart = 0;
    let yStart = 0;

    function isActiveDelta(e: MouseEvent): boolean
    {
        const { xDelta, yDelta } = getDelta(e);
        return Math.abs(xDelta) > xDistThreshold || Math.abs(yDelta) > yDistThreshold;
    }

    function getDelta(e: MouseEvent)
    {
        return {
            xDelta: e.clientX - xStart + startX,
            yDelta: e.clientY - yStart + startY,
        };
    }

    function onMouseMove(e: MouseEvent)
    {
        if (!hasInit)
        {
            // init
            hasInit = true;
            xStart = e.clientX;
            yStart = e.clientY;
        }

        if (!hasStarted)
        {
            // check for move delta threshold
            if (isActiveDelta(e))
            {
                // start
                hasStarted = true;

                onStart({ sourceEvent: e, ...getDelta(e) });
            }
        } else
        {
            // move
            onMove({ sourceEvent: e, ...getDelta(e) });
        }
    }

    function onMouseUp(e: MouseEvent)
    {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (hasStarted)
        {
            onEnd({ sourceEvent: e, ...getDelta(e) });
        }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}