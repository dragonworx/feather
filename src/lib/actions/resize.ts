import type { ActionReturn } from 'svelte/action';

type Attributes = {
    'on:resize'?: (e: CustomEvent<{ width: number; height: number }>) => void;
}

export default function resize(node: HTMLElement): ActionReturn<undefined, Attributes>
{
    node.addEventListener('mousedown', (e) =>
    {
        const { clientX, clientY } = e;
        const bounds = node.getBoundingClientRect();
        const startX = clientX - bounds.left;
        const startY = clientY - bounds.top;

        function onMouseMove(e: MouseEvent)
        {
            const { clientX, clientY } = e;
            const localX = clientX - bounds.left;
            const localY = clientY - bounds.top;
            const deltaX = localX - startX;
            const deltaY = localY - startY;
            const width = bounds.width + deltaX;
            const height = bounds.height + deltaY;

            node.style.width = `${width}px`;
            node.style.height = `${height}px`;

            node.dispatchEvent(new CustomEvent('resize', {
                detail: { width, height },
            }));
        }

        function onMouseUp()
        {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    return {
        destroy: () =>
        {

        }
    };
}