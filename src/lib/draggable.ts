export interface DraggableEvent
{
    sourceEvent: MouseEvent;
	xDelta: number;
	yDelta: number;
}

export interface DragOptions {
    startX: number;
    startY: number;
    xDistThreshold: number;
	yDistThreshold: number;
    onStart: (e: DraggableEvent) => void;
    onMove: (e: DraggableEvent) => void;
    onEnd: (e: DraggableEvent) => void;
}

const defaultOptions: DragOptions = {
    startX: 0,
    startY: 0,
    xDistThreshold: 5,
    yDistThreshold: 5,
    onStart: () => {},
    onMove: () => {},
    onEnd: () => {},
};

export function drag(options: Partial<DragOptions>) {
    const opts: Required<DragOptions> = {
        ...defaultOptions,
        ...options,
    };

     const { startX, startY, xDistThreshold, yDistThreshold, onStart, onMove, onEnd } = opts;

    let isActive = false;
    let xDelta = 0;
    let yDelta = 0;

    function isActiveDelta(xDelta: number, yDelta: number): boolean
	{
		return Math.abs(xDelta) > xDistThreshold || Math.abs(yDelta) > yDistThreshold;
	}

    function onMouseMove(e: MouseEvent) {
        if (!isActive) {
            xDelta = e.clientX - startX;
            yDelta = e.clientY - startY;

            if (isActiveDelta(xDelta, yDelta)) {
                onStart({ sourceEvent: e, xDelta, yDelta });
                isActive = true;
            }
        } else {
            xDelta = e.clientX - startX;
            yDelta = e.clientY - startY;
        }

        onMove({ sourceEvent: e, xDelta, yDelta });
    }

    function onMouseUp(e: MouseEvent) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        onEnd({ sourceEvent: e, xDelta, yDelta });
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}