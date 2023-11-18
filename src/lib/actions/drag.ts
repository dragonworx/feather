/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionReturn } from 'svelte/action';

export type DragOptions =
    {
        startX: number;
        startY: number;
        xDistThreshold: number;
        yDistThreshold: number;
        direction: 'horizontal' | 'vertical' | 'both';
        constrain: boolean;
        parent: string | HTMLElement;
        onStart: (e: DragEvent) => void;
        onMove: (e: DragEvent) => void;
        onEnd: (e: DragEvent) => void;
    }

const defaultOptions: Omit<Required<DragOptions>, 'parent'> = {
    startX: 0,
    startY: 0,
    xDistThreshold: 1,
    yDistThreshold: 1,
    direction: 'both',
    constrain: true,
    onStart: () => { },
    onMove: () => { },
    onEnd: () => { },
};

interface Attributes
{
    'on:drag-start'?: (e: CustomEvent<DraggableEvent>) => void;
    'on:drag-move'?: (e: CustomEvent<DraggableEvent>) => void;
    'on:drag-end'?: (e: CustomEvent<DraggableEvent>) => void;
}

type Props = Omit<DragOptions, 'onStart' | 'onMove' | 'onEnd'>;

interface DragEvent
{
    sourceEvent: MouseEvent;
    xDelta: number;
    yDelta: number;
}

interface AppliedDrag
{
    top: number;
    left: number;
    xOffset: number;
    yOffset: number;
}

type DraggableEvent = DragEvent & AppliedDrag;

export function drag(node: HTMLElement, props: Partial<Props> = {}): ActionReturn<Props, Attributes>
{
    node.addEventListener('mousedown', () =>
    {
        const parent: HTMLElement = (props.parent instanceof HTMLElement
            ? props.parent
            : typeof props.parent === 'string'
                ? node.closest(props.parent)
                : node.parentElement) as HTMLElement;

        const opts: DragOptions = {
            ...defaultOptions,
            ...props,
            startX: props?.startX ?? defaultOptions.startX,
            startY: props?.startY ?? defaultOptions.startY,
            parent,
            onStart,
            onMove,
            onEnd,
        };

        const { direction, constrain } = opts;

        const nodeTop = node.offsetTop;
        const nodeLeft = node.offsetLeft;
        const parentBounds = parent.getBoundingClientRect();

        /** drag has started */
        function onStart(e: DragEvent)
        {
            node.dispatchEvent(new CustomEvent('drag-start', {
                detail: {
                    ...e,
                    ...applyDrag(e),
                }
            }));
        }

        /** drag is moving */
        function onMove(e: DragEvent)
        {
            node.dispatchEvent(new CustomEvent('drag-move', {
                detail: {
                    ...e,
                    ...applyDrag(e),
                }
            }));
        }

        /** drag has ended */
        function onEnd(e: DragEvent)
        {
            node.dispatchEvent(new CustomEvent('drag-end', {
                detail: {
                    ...e,
                    ...applyDrag(e),
                }
            }));
        }

        function applyDrag(e: DragEvent): AppliedDrag
        {
            let top = direction !== 'horizontal' ? nodeTop + e.yDelta : nodeTop;
            let left = direction !== 'vertical' ? nodeLeft + e.xDelta : nodeLeft;

            node.style.top = `${top}px`;
            node.style.left = `${left}px`;

            // calculate new bounding client rect for node
            const newBounds = node.getBoundingClientRect();

            if (constrain)
            {
                if (newBounds.top < parentBounds.top)
                {
                    top += parentBounds.top - newBounds.top;
                } else if (newBounds.bottom > parentBounds.bottom)
                {
                    top -= newBounds.bottom - parentBounds.bottom;
                }

                if (newBounds.left < parentBounds.left)
                {
                    left += parentBounds.left - newBounds.left;
                } else if (newBounds.right > parentBounds.right)
                {
                    left -= newBounds.right - parentBounds.right;
                }

                node.style.top = `${top}px`;
                node.style.left = `${left}px`;
            }

            return {
                top,
                left,
                xOffset: left / parentBounds.width,
                yOffset: top / parentBounds.height,
            };
        }

        // begin the drag operation
        beginDrag(opts)
    });

    return {
        update: (updatedProp) => { },
        destroy: () => { }
    };
}

export default function beginDrag(opts: DragOptions)
{
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